"""Rule based proposals.

Pure functions on a plain inventory (see inventory.py), so they can be tested
without a running Home Assistant.
"""

from __future__ import annotations

import copy
import hashlib
import json
import re
from typing import Any

from .const import LLM_MAX_CONFIDENCE, SAFE_CONFIDENCE
from .status import entity_status

# Things people ask a voice assistant to switch or read.
CONTROL_DOMAINS = {
    "alarm_control_panel",
    "climate",
    "cover",
    "fan",
    "humidifier",
    "lawn_mower",
    "light",
    "lock",
    "media_player",
    "switch",
    "todo",
    "vacuum",
    "valve",
    "water_heater",
    "weather",
}

# Never useful for an assistant.
NEVER_DOMAINS = {
    "ai_task",
    "assist_satellite",
    "automation",
    "conversation",
    "event",
    "image",
    "stt",
    "tts",
    "update",
    "wake_word",
}

# Sensor classes that are technical noise for an assistant.
NOISY_DEVICE_CLASSES = {
    "current",
    "data_rate",
    "data_size",
    "frequency",
    "signal_strength",
    "timestamp",
    "voltage",
}

_TECHNICAL_NAME = re.compile(
    r"0x[0-9a-f]{4,}"  # zigbee ieee address
    r"|(?:[0-9a-f]{2}[:-]){3,}[0-9a-f]{2}"  # mac address
    r"|[0-9a-f]{6,}"  # long hex id
    r"|^[a-z]+[-_][0-9a-f]{4,}"  # shelly1-a4cf12, tasmota_1a2b3c
    r"|_",
    re.IGNORECASE,
)

_FOLD = str.maketrans({"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss"})


def normalize(text: str | None) -> str:
    """Lower case, fold umlauts, keep letters and digits only."""
    text = (text or "").lower().translate(_FOLD)
    return " ".join(re.findall(r"[a-z0-9]+", text))


def looks_technical(name: str | None) -> bool:
    """True for names nobody would say out loud."""
    if not name or not name.strip():
        return True
    return bool(_TECHNICAL_NAME.search(name.strip()))


def _area_terms(area: dict) -> list[str]:
    return [t for t in (normalize(n) for n in [area["name"], *area.get("aliases", [])]) if t]


def _term_in(term: str, text: str) -> bool:
    """Whole word match, or start of a compound word for longer terms."""
    words = text.split()
    if " " in term:
        return f" {term} " in f" {text} "
    if term in words:
        return True
    return len(term) >= 4 and any(w.startswith(term) for w in words)


def area_from_name(areas: dict[str, dict], *names: str | None) -> tuple[str, float] | None:
    """Guess an area from names. Returns (area_id, confidence)."""
    text = " ".join(normalize(n) for n in names if n)
    if not text:
        return None
    hits: dict[str, int] = {}
    for area_id, area in areas.items():
        for term in _area_terms(area):
            if _term_in(term, text):
                hits[area_id] = max(hits.get(area_id, 0), len(term))
    if not hits:
        return None
    best = max(hits, key=lambda a: hits[a])
    return best, 0.9 if len(hits) == 1 else 0.75


def _exposure_rule(ent: dict) -> tuple[bool, float, str] | None:
    """Proposed exposure for one entity: (exposed, confidence, reason)."""
    if ent.get("entity_category") in ("diagnostic", "config"):
        return False, 0.95, "category"
    if ent.get("hidden"):
        return False, 0.9, "hidden"
    if ent["domain"] in NEVER_DOMAINS:
        return False, 0.9, "domain_never"
    if ent["domain"] == "sensor" and ent.get("device_class") in NOISY_DEVICE_CLASSES:
        return False, 0.85, "sensor_noise"
    if ent["domain"] in CONTROL_DOMAINS:
        return True, 0.6, "domain_control"
    return None


def main_entity(inv: dict, entity_ids: list[str]) -> str | None:
    """The entity a person means when naming the device."""
    for entity_id in entity_ids:
        ent = inv["entities"][entity_id]
        if ent["domain"] in CONTROL_DOMAINS and not ent.get("entity_category"):
            return entity_id
    return None


def fingerprint(inv: dict, unit_id: str) -> str:
    """Hash of everything a decision about this unit depends on."""
    kind, _, key = unit_id.partition(":")
    data: dict[str, Any] = {}
    if kind == "device":
        dev = inv["devices"].get(key)
        if dev is None:
            return ""
        data["d"] = [dev.get("area_id"), dev.get("name_by_user")]
        entity_ids = dev["entity_ids"]
    else:
        entity_ids = [key] if key in inv["entities"] else []
    data["e"] = [
        [
            e["entity_id"],
            e.get("exposed"),
            sorted(e.get("aliases", [])),
            e.get("area_id"),
            e.get("restored"),
        ]
        for e in (inv["entities"][i] for i in sorted(entity_ids))
    ]
    return hashlib.sha1(json.dumps(data, sort_keys=True).encode()).hexdigest()[:12]


def _entity_row(ent: dict) -> dict:
    row = {
        "entity_id": ent["entity_id"],
        "title": ent.get("title") or ent["entity_id"],
        "domain": ent["domain"],
        "category": ent.get("entity_category"),
        "current": {
            "exposed": ent.get("exposed", False),
            "aliases": list(ent.get("aliases", [])),
            # disabled entities are not in the inventory, so only these three occur here
            "status": entity_status(ent.get("exposed", False), bool(ent.get("hidden")), False),
        },
        "proposed": {
            "exposed": ent.get("exposed", False),
            "aliases": list(ent.get("aliases", [])),
            "remove": False,
        },
        "reasons": [],
        "confidence": 1.0,
    }
    if ent.get("restored"):
        # Not provided right now. Often only offline (printer off, tablet away) or loaded
        # on demand, so removal is never proposed; the "orphans" list offers it on request.
        row["reasons"].append({"code": "orphaned"})
        return row
    rule = _exposure_rule(ent)
    if rule and rule[0] != row["current"]["exposed"]:
        row["proposed"]["exposed"] = rule[0]
        row["reasons"].append({"code": rule[2]})
        row["confidence"] = rule[1]
    return row


def entity_changed(row: dict) -> bool:
    cur, pro = row["current"], row["proposed"]
    return (
        pro["remove"] or pro["exposed"] != cur["exposed"] or sorted(pro["aliases"]) != sorted(cur["aliases"])
    )


def _finish(prop: dict) -> dict:
    """Compute confidence and the safe flag."""
    confidences = [r["confidence"] for r in prop["entities"] if entity_changed(r)]
    if prop["proposed"]["area_id"] != prop["current"]["area_id"]:
        confidences.append(prop["area_confidence"])
    if prop["proposed"]["name"] != prop["current"]["name"]:
        confidences.append(prop["name_confidence"])
    prop["changes"] = len(confidences)
    prop["confidence"] = round(min(confidences), 2) if confidences else 0.0
    open_flags = [
        f
        for f in prop["flags"]
        if (f == "area_missing" and not prop["proposed"]["area_id"])
        or (f == "name_technical" and not prop["proposed"]["name"])
    ]
    prop["safe"] = bool(
        confidences
        and prop["confidence"] >= SAFE_CONFIDENCE
        and not open_flags
        and not any(r["proposed"]["remove"] for r in prop["entities"])
    )
    prop["relevant"] = bool(confidences or open_flags)
    return prop


def _device_proposal(inv: dict, dev: dict) -> dict:
    rows = [_entity_row(inv["entities"][i]) for i in dev["entity_ids"]]
    prop = {
        "id": f"device:{dev['device_id']}",
        "kind": "device",
        "title": dev.get("name") or dev.get("model") or dev["device_id"],
        "manufacturer": dev.get("manufacturer"),
        "model": dev.get("model"),
        "integration": dev.get("integration"),
        "current": {"area_id": dev.get("area_id"), "name": dev.get("name_by_user")},
        "proposed": {"area_id": dev.get("area_id"), "name": dev.get("name_by_user")},
        "area_confidence": 1.0,
        "name_confidence": 1.0,
        "flags": [],
        "reasons": [],
        "source": "rule",
        "main_entity": main_entity(inv, dev["entity_ids"]),
        "entities": rows,
        "fingerprint": fingerprint(inv, f"device:{dev['device_id']}"),
    }
    wanted = any(r["proposed"]["exposed"] and not r["proposed"]["remove"] for r in rows)
    # A voice device without area: the assistant cannot tell where someone speaks.
    speaker = any(r["domain"] == "assist_satellite" for r in rows)
    if speaker and dev.get("area_id") is None:
        prop["flags"].append("speaker")
    if dev.get("area_id") is None and not dev.get("service") and (wanted or speaker):
        guess = area_from_name(inv["areas"], dev.get("name"), dev.get("default_name"))
        if guess:
            prop["proposed"]["area_id"], prop["area_confidence"] = guess
            prop["reasons"].append({"code": "area_from_name", "area": guess[0]})
        else:
            prop["flags"].append("area_missing")
    if not dev.get("name_by_user") and looks_technical(dev.get("name")) and wanted:
        prop["flags"].append("name_technical")
    return _finish(prop)


def _entity_proposal(inv: dict, ent: dict) -> dict:
    row = _entity_row(ent)
    prop = {
        "id": f"entity:{ent['entity_id']}",
        "kind": "entity",
        "title": ent.get("title") or ent["entity_id"],
        "manufacturer": None,
        "model": None,
        "integration": ent.get("platform"),
        "current": {"area_id": ent.get("area_id"), "name": ent.get("name")},
        "proposed": {"area_id": ent.get("area_id"), "name": ent.get("name")},
        "area_confidence": 1.0,
        "name_confidence": 1.0,
        "flags": [],
        "reasons": [],
        "source": "rule",
        "main_entity": ent["entity_id"] if ent["domain"] in CONTROL_DOMAINS else None,
        "entities": [row],
        "fingerprint": fingerprint(inv, f"entity:{ent['entity_id']}"),
    }
    if ent.get("area_id") is None and row["proposed"]["exposed"] and not row["proposed"]["remove"]:
        guess = area_from_name(inv["areas"], ent.get("title"), ent["entity_id"].split(".", 1)[1])
        if guess:
            prop["proposed"]["area_id"] = guess[0]
            prop["area_confidence"] = min(guess[1], 0.85)
            prop["reasons"].append({"code": "area_from_name", "area": guess[0]})
    return _finish(prop)


def build_proposals(inv: dict) -> dict[str, dict]:
    """All proposals that need a look, keyed by unit id."""
    result: dict[str, dict] = {}
    for dev in inv["devices"].values():
        if not dev["entity_ids"]:
            continue
        prop = _device_proposal(inv, dev)
        if prop["relevant"]:
            result[prop["id"]] = prop
    for ent in inv["entities"].values():
        if ent.get("device_id") in inv["devices"]:
            continue
        prop = _entity_proposal(inv, ent)
        if prop["relevant"]:
            result[prop["id"]] = prop
    return result


def needs_llm(prop: dict) -> bool:
    """Open questions that rules could not answer."""
    return prop["kind"] == "device" and (
        ("area_missing" in prop["flags"] and not prop["proposed"]["area_id"])
        or ("name_technical" in prop["flags"] and not prop["proposed"]["name"])
    )


def merge_llm(prop: dict, suggestion: dict, inv: dict) -> dict:
    """Fill the gaps of a proposal with an LLM suggestion. Rules win."""
    prop = copy.deepcopy(prop)
    try:
        conf = min(float(suggestion.get("confidence", 0.5)), LLM_MAX_CONFIDENCE)
    except (TypeError, ValueError):
        conf = 0.5
    used = False

    area_id = suggestion.get("area_id")
    if (
        "area_missing" in prop["flags"]
        and not prop["proposed"]["area_id"]
        and isinstance(area_id, str)
        and area_id in inv["areas"]
    ):
        prop["proposed"]["area_id"] = area_id
        prop["area_confidence"] = conf
        prop["reasons"].append({"code": "llm_area", "area": area_id})
        used = True

    name = suggestion.get("name")
    if "name_technical" in prop["flags"] and not prop["proposed"]["name"] and isinstance(name, str):
        name = name.strip()[:60]
        if name and not looks_technical(name):
            prop["proposed"]["name"] = name
            prop["name_confidence"] = conf
            prop["reasons"].append({"code": "llm_name"})
            used = True

    if suggestion.get("relevant") is False:
        for row in prop["entities"]:
            if row["proposed"]["exposed"] and not row["proposed"]["remove"]:
                row["proposed"]["exposed"] = False
                row["reasons"].append({"code": "llm_irrelevant"})
                row["confidence"] = conf
                used = True
    else:
        aliases = suggestion.get("aliases")
        main = next((r for r in prop["entities"] if r["entity_id"] == prop["main_entity"]), None)
        if main and isinstance(aliases, list) and not main["current"]["aliases"]:
            clean = []
            for alias in aliases[:3]:
                if isinstance(alias, str) and (alias := alias.strip()[:40]) and alias not in clean:
                    clean.append(alias)
            if clean:
                main["proposed"]["aliases"] = clean
                main["reasons"].append({"code": "llm_aliases"})
                main["confidence"] = conf
                used = True

    if used:
        prop["source"] = "llm"
        if reason := suggestion.get("reason"):
            prop["reasons"].append({"code": "llm_note", "text": str(reason)[:200]})
    return _finish(prop)


def orphans(inv: dict, skip: set[str] | None = None) -> list[dict]:
    """Entities no integration provides right now, grouped by integration.

    Restored entities of a running integration can be gone for good, or just offline,
    or created only while a device reports. `device_live` tells whether other entities
    of the same device are provided right now (then the device itself is still there).
    """
    groups: dict[str, dict] = {}
    for ent in inv["entities"].values():
        if not ent.get("restored") or ent["entity_id"] in (skip or ()):
            continue
        dev = inv["devices"].get(ent.get("device_id") or "")
        device_live = bool(dev) and any(
            not inv["entities"][e].get("restored") for e in dev["entity_ids"] if e != ent["entity_id"]
        )
        group = groups.setdefault(
            ent.get("platform") or "?",
            {"integration": ent.get("platform") or "?", "running": ent.get("entry_ok", True), "entities": []},
        )
        group["entities"].append(
            {
                "entity_id": ent["entity_id"],
                "title": ent.get("title") or ent["entity_id"],
                "device": dev.get("name") if dev else None,
                "device_live": device_live,
            }
        )
    for group in groups.values():
        group["entities"].sort(key=lambda e: (e["device"] or "", e["entity_id"]))
    return sorted(groups.values(), key=lambda g: (-len(g["entities"]), g["integration"]))
