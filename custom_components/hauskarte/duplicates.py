"""Find the same physical thing reachable through two integrations (Loxone + Shelly, Loxone + KNX …).

Two kinds of evidence:
- history: both switch at the same moments, again and again (strong; works with any names)
- name: same kind, very similar name, same room (weaker)

"Merging" never touches the integrations: one entity stays for the assistant, the others are
hidden and not exposed. Automations and the original systems keep working unchanged.
"""

from __future__ import annotations

from collections import defaultdict
from difflib import SequenceMatcher
from typing import Any

from .kinds import entity_kind
from .rules import looks_technical, normalize

# Which kinds can be the same thing seen twice.
GROUP = {
    "light": "power",
    "switch": "power",
    "socket": "power",
    "shading": "cover",
    "window": "cover",
    "door": "cover",
    "heating": "climate",
    "lock": "lock",
    "fan": "fan",
    "contact": "contact",
    "motion": "motion",
}
DOMAINS = {"light", "switch", "cover", "climate", "lock", "fan", "binary_sensor"}

# Integrations that carry many different systems; for these the bridge or maker tells them apart
# (Zigbee2MQTT and Tasmota both arrive through MQTT).
CARRIER_PLATFORMS = {"mqtt", "template"}
# Never the same device, only a bundle of devices.
GROUP_PLATFORMS = {"group"}

GENERIC_WORDS = {
    "licht", "light", "schalter", "switch", "relay", "relais", "kanal", "channel", "ausgang", "output",
    "status", "state", "ein", "aus", "on", "off", "the", "der", "die", "das",
}  # fmt: skip

HISTORY_TOLERANCE = 4.0  # seconds between the two switchings
MIN_EVENTS = 3
MIN_SHARE = 0.7


def effective_area(inv: dict, ent: dict) -> str | None:
    if ent.get("area_id"):
        return ent["area_id"]
    dev = inv["devices"].get(ent.get("device_id") or "")
    return dev.get("area_id") if dev else None


def candidates(inv: dict, skip: set[str] | None = None) -> dict[str, dict]:
    """Entities that could have a twin, with what pairing needs."""
    skip = skip or set()
    result = {}
    for ent in inv["entities"].values():
        if (
            ent["domain"] not in DOMAINS
            or ent.get("entity_category")
            or ent.get("restored")
            or ent.get("hidden")
            or ent.get("is_group")  # a group moves with its members by design
            or ent.get("platform") in GROUP_PLATFORMS
            or ent["entity_id"] in skip
        ):
            continue
        dev = inv["devices"].get(ent.get("device_id") or "")
        kind = entity_kind(ent, dev.get("name") if dev else None)
        if kind not in GROUP:
            continue
        platform = ent.get("platform") or "?"
        source = platform
        if platform in CARRIER_PLATFORMS and dev:
            source = f"{platform}:{dev.get('manufacturer') or dev.get('model') or dev['device_id']}"
        result[ent["entity_id"]] = {
            "entity_id": ent["entity_id"],
            "title": ent.get("title") or ent["entity_id"],
            "platform": platform,
            "source": source,
            "device_id": ent.get("device_id"),
            "kind": kind,
            "group": GROUP[kind],
            "area_id": effective_area(inv, ent),
            "exposed": bool(ent.get("exposed")),
            "device": dev.get("name") if dev else None,
        }
    return result


def _pairable(a: dict, b: dict) -> bool:
    """Same kind of thing, from two different systems, not two parts of one device."""
    same_device = a["device_id"] is not None and a["device_id"] == b["device_id"]
    return a["group"] == b["group"] and a["source"] != b["source"] and not same_device


def _core_name(title: str, area_terms: set[str]) -> str:
    words = [w for w in normalize(title).split() if w not in GENERIC_WORDS and w not in area_terms]
    return " ".join(words)


def name_pairs(inv: dict, cand: dict[str, dict], threshold: float = 0.85) -> list[dict]:
    """Same kind, same room, nearly the same name, different integration."""
    area_terms = {t for a in inv["areas"].values() for t in normalize(a["name"]).split()}
    by_area: dict[str | None, list[dict]] = defaultdict(list)
    for c in cand.values():
        by_area[c["area_id"]].append(c)
    pairs = []
    for area_id, items in by_area.items():
        if area_id is None:
            continue  # without a room a similar name says too little
        for i, a in enumerate(items):
            core_a = _core_name(a["title"], area_terms)
            for b in items[i + 1 :]:
                if not _pairable(a, b):
                    continue
                core_b = _core_name(b["title"], area_terms)
                if not core_a or not core_b:
                    continue
                score = SequenceMatcher(None, core_a, core_b).ratio()
                if score >= threshold:
                    a_id, b_id = sorted((a["entity_id"], b["entity_id"]))
                    pairs.append({"a": a_id, "b": b_id, "kind": "name", "score": round(score, 2)})
    return pairs


def history_pairs(
    times: dict[str, list[float]],
    cand: dict[str, dict],
    tolerance: float = HISTORY_TOLERANCE,
    min_events: int = MIN_EVENTS,
    min_share: float = MIN_SHARE,
) -> list[dict]:
    """Entities whose state changes happen together. `times`: change timestamps per entity."""
    buckets: dict[int, set[str]] = defaultdict(set)
    for entity_id, stamps in times.items():
        if entity_id in cand:
            for t in stamps:
                buckets[int(t // tolerance)].add(entity_id)
    hits: dict[tuple[str, str], int] = defaultdict(int)
    for a, stamps in times.items():
        if a not in cand or len(stamps) < min_events:
            continue
        for t in stamps:
            b0 = int(t // tolerance)
            near = buckets.get(b0 - 1, set()) | buckets.get(b0, set()) | buckets.get(b0 + 1, set())
            for b in near:
                if b != a and _pairable(cand[a], cand[b]):
                    hits[(a, b)] += 1
    pairs = []
    for (a, b), n_ab in hits.items():
        if a > b:
            continue
        n_ba = hits.get((b, a), 0)
        na, nb = len(times[a]), len(times[b])
        if min(na, nb) < min_events:
            continue
        if n_ab / na >= min_share and n_ba / nb >= min_share:
            pairs.append({"a": a, "b": b, "kind": "history", "together": min(n_ab, n_ba), "of": max(na, nb)})
    return pairs


def transitions(states: list[tuple[float, str | None]]) -> list[float]:
    """Moments a state really changed (ignoring unavailable/unknown gaps)."""
    result = []
    prev = None
    for ts, state in states:
        if state in (None, "unavailable", "unknown"):
            prev = None
            continue
        if prev is not None and state != prev:
            result.append(ts)
        prev = state
    return result


def suggest_primary(members: list[dict]) -> str:
    """The entity the assistant should use: only generic signals, no favourite integrations."""

    def score(m: dict) -> tuple:
        return (
            m["kind"] == "light",
            not looks_technical(m["title"]),
            m["exposed"],
            m["area_id"] is not None,
            -len(m["title"]),
        )

    return max(members, key=score)["entity_id"]


def group_key(entity_ids: list[str]) -> str:
    return "|".join(sorted(entity_ids))


def build_groups(cand: dict[str, dict], pairs: list[dict]) -> list[dict[str, Any]]:
    """Connected pairs become groups (Loxone + Shelly + KNX for one light)."""
    parent: dict[str, str] = {}

    def find(x: str) -> str:
        parent.setdefault(x, x)
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for p in pairs:
        parent[find(p["a"])] = find(p["b"])
    members: dict[str, list[str]] = defaultdict(list)
    for x in list(parent):
        members[find(x)].append(x)
    groups = []
    for ids in members.values():
        ids = sorted(ids)
        evidence = [p for p in pairs if p["a"] in ids and p["b"] in ids]
        items = [cand[i] for i in ids]
        groups.append(
            {
                "key": group_key(ids),
                "members": items,
                "evidence": evidence,
                "strong": any(e["kind"] == "history" for e in evidence),
                "primary": suggest_primary(items),
            }
        )
    return sorted(groups, key=lambda g: (not g["strong"], g["members"][0]["title"].lower()))
