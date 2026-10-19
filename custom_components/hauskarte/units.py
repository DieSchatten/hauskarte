"""What there is to decide about one unit – a device, or the device-less functions of one integration.

One list of suggestions from every source (rules, AI, "a switch that is really a light"), each with an id so it
can be ticked and applied. Pure: the manager hands in proposals and functions, and writes what was chosen.
"""

from __future__ import annotations

from .status import ASSISTANT, DISABLED, HA, HIDDEN

# Kinds HA itself can show a switch as ("Show as" / switch_as_x). Only then does the voice assistant
# understand "turn off the light …" for a switch that drives a light.
KIND_DOMAIN = {"light": "light", "shading": "cover", "fan": "fan", "lock": "lock", "water": "valve"}


def device_unit(device_id: str) -> str:
    return f"device:{device_id}"


def standalone_unit(platform: str) -> str:
    return f"standalone:{platform}"


def proposed_status(row: dict) -> str:
    """A proposal speaks about the assistant only; what HA hides or has switched off stays so."""
    now = (row.get("now") or row["current"]).get("status")
    current = now or (ASSISTANT if row["current"]["exposed"] else HA)
    if row["proposed"]["exposed"]:
        return ASSISTANT
    return current if current in (HIDDEN, DISABLED) else HA


def suggestions(proposals: list[dict], functions: list[dict]) -> list[dict]:
    """Everything suggested for a unit. Later sources win over earlier ones for the same thing (AI over rules)."""
    out: dict[str, dict] = {}

    def add(
        sid: str, kind: str, value, entity_id: str | None, source: str, reasons=None, reason="", pid=None
    ):
        out[sid] = {
            "id": sid,
            "type": kind,
            "entity_id": entity_id,
            "value": value,
            "source": source,
            "reasons": reasons or [],
            "reason": reason,
            "pid": pid,  # the stored proposal it comes from, if any
        }

    for prop in proposals:
        # "now" = the registries as they are; a part of a proposal holds only while untouched since it was made
        scoped = prop["id"].startswith("entity:")
        target = prop["id"][7:] if scoped else None
        cur, pro = prop["current"], prop["proposed"]
        now = prop.get("now") or cur
        codes = prop.get("reasons") or []
        if (
            pro.get("area_id")
            and pro["area_id"] != now.get("area_id")
            and now.get("area_id") == cur.get("area_id")
        ):
            area_reasons = [
                r for r in codes if r.get("code") in ("area_from_name", "llm_area", "area_missing")
            ]
            add(
                f"area:{target}" if scoped else "area",
                "area",
                pro["area_id"],
                target,
                prop["source"],
                area_reasons,
                pid=prop["id"],
            )
        if pro.get("name") and pro["name"] != now.get("name") and now.get("name") == cur.get("name"):
            name_reasons = [r for r in codes if r.get("code") in ("llm_name", "name_technical")]
            add(
                f"name:{target}" if scoped else "name",
                "name",
                pro["name"],
                target,
                prop["source"],
                name_reasons,
                pid=prop["id"],
            )
        for row in prop["entities"]:
            if row["proposed"].get("remove"):
                continue
            eid = row["entity_id"]
            row_now = row.get("now") or row["current"]
            to = proposed_status(row)
            touched = row_now.get("exposed", row["current"]["exposed"]) != row["current"]["exposed"]
            if to != row_now.get("status") and not touched:
                add(f"status:{eid}", "status", to, eid, prop["source"], row.get("reasons"), pid=prop["id"])
            wanted = row["proposed"].get("aliases") or []
            had = sorted(row["current"].get("aliases") or [])
            has = sorted(row_now.get("aliases") if row_now.get("aliases") is not None else had)
            if wanted and sorted(wanted) != has and has == had:
                add(
                    f"aliases:{eid}",
                    "aliases",
                    wanted,
                    eid,
                    prop["source"],
                    row.get("reasons"),
                    pid=prop["id"],
                )

    for f in functions:
        eid = f["entity_id"]
        ai = f.get("ai") or {}
        if ai.get("status") and ai["status"] != f["status"]:
            add(f"status:{eid}", "status", ai["status"], eid, "ai", reason=ai.get("reason", ""))
        if ai.get("kind") and ai["kind"] != f.get("kind"):
            add(f"kind:{eid}", "kind", ai["kind"], eid, "ai", reason=ai.get("reason", ""))
        kind = out[f"kind:{eid}"]["value"] if f"kind:{eid}" in out else f.get("kind")
        wanted_status = out[f"status:{eid}"]["value"] if f"status:{eid}" in out else f["status"]
        if (
            f.get("domain") == "switch"
            and not f.get("technical")  # a configuration switch of a device is no light
            and not f.get("wrapped_as")
            and kind in KIND_DOMAIN
            and wanted_status in (ASSISTANT, HA)
        ):
            add(f"convert:{eid}", "convert", KIND_DOMAIN[kind], eid, "rule", [{"code": "convert"}])
    return list(out.values())


def apply_order(chosen: list[dict]) -> list[dict]:
    """Kind before showing-as (it decides what to show as), everything else first."""
    rank = {"area": 0, "name": 0, "status": 1, "aliases": 1, "kind": 2, "convert": 3}
    return sorted(chosen, key=lambda s: rank.get(s["type"], 1))


def fingerprint(entity_ids: list[str]) -> str:
    return "|".join(sorted(entity_ids))


def still_done(stored: str | None, entity_ids: list[str]) -> bool:
    """A unit stays done until it gets new functions (functions going away do not bring it back)."""
    if stored is None:
        return False
    return set(entity_ids) <= set(stored.split("|")) if stored else not entity_ids
