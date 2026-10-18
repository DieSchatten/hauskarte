"""AI review: the language model looks at every cleanup step and recommends, with a reason.

Pure prompt building and answer checking. Nothing here changes anything; the panel shows the
advice next to each item and the user applies it by click.
"""

from __future__ import annotations

import json
from typing import Any

SYSTEM = """You help tidy up a Home Assistant installation so that a voice assistant understands the home.
You get one task with data as JSON. Answer with JSON only, no other text.
Write every "reason" in the language "{language}", short (at most 15 words), concrete, no greetings.
If you are not sure, say so with a low confidence instead of guessing."""

SWITCH_KINDS = ["light", "socket", "shading", "heating", "fan", "water", "switch"]


def system(language: str) -> str:
    return SYSTEM.format(language=language)


def _dump(data: Any) -> str:
    return json.dumps(data, ensure_ascii=False, indent=1)


def _conf(value: Any) -> float:
    try:
        return round(min(max(float(value), 0.0), 1.0), 2)
    except (TypeError, ValueError):
        return 0.5


def _reason(value: Any) -> str:
    return str(value or "").strip()[:200]


# --- floors -----------------------------------------------------------------


def floors_task(inv: dict, room_devices: dict[str, list[str]], language: str) -> str:
    """Floor names, and for every room the floor it is on – judged by what is in it."""
    floors = [
        {"floor_id": f["floor_id"], "name": f["name"], "level": f.get("level")}
        for f in inv["floors"].values()
    ]
    rooms = [
        {
            "area_id": a["area_id"],
            "name": a["name"],
            "current_floor_id": a.get("floor_id"),
            "devices": room_devices.get(a["area_id"], [])[:15],
        }
        for a in inv["areas"].values()
    ]
    return f"""Task: floors.
Floors are given with their level (higher = further up). For EVERY room: the floor it is on. Judge from the room
name AND the devices in it (device names often name the floor or flat, e.g. "Waschmaschine Keller").
Two rooms with the same kind of name (two bathrooms) are usually on different floors – tell them apart by their
devices. Keep current_floor_id when it fits. The reason must name the device or word that shows it. floor_id null
if you cannot tell. Do not rename floors.
Answer: {{"rooms": [{{"area_id": "...", "floor_id": "...", "reason": "...", "confidence": 0.5}}]}}
Data:
{_dump({"floors": floors, "rooms": rooms})}"""


def parse_floors(data: dict, inv: dict) -> dict:
    floors_out = []
    for f in data.get("floors") or []:
        if not isinstance(f, dict) or f.get("floor_id") not in inv["floors"]:
            continue
        cur = inv["floors"][f["floor_id"]]
        name = str(f.get("name") or "").strip()[:60] or cur["name"]
        level = f.get("level") if isinstance(f.get("level"), int) else cur.get("level")
        if name == cur["name"] and level == cur.get("level"):
            continue
        floors_out.append(
            {
                "floor_id": f["floor_id"],
                "old_name": cur["name"],
                "name": name,
                "old_level": cur.get("level"),
                "level": level,
                "reason": _reason(f.get("reason")),
                "confidence": _conf(f.get("confidence")),
            }
        )
    rooms_out = []
    for r in data.get("rooms") or []:
        if not isinstance(r, dict) or r.get("area_id") not in inv["areas"]:
            continue
        area = inv["areas"][r["area_id"]]
        if r.get("floor_id") not in inv["floors"] or r["floor_id"] == area.get("floor_id"):
            continue  # unknown floor, or the room is already there
        rooms_out.append(
            {
                "area_id": r["area_id"],
                "name": area["name"],
                "current_floor_id": area.get("floor_id"),
                "floor_id": r["floor_id"],
                "reason": _reason(r.get("reason")),
                "confidence": _conf(r.get("confidence")),
            }
        )
    return {"floors": floors_out, "rooms": rooms_out}


# --- duplicates -------------------------------------------------------------


def duplicates_task(groups: list[dict], area_names: dict[str, str]) -> str:
    items = [
        {
            "key": g["key"],
            "evidence": g["evidence"],
            "members": [
                {
                    "entity_id": m["entity_id"],
                    "name": m["title"],
                    "integration": m["platform"],
                    "kind": m["kind"],
                    "room": area_names.get(m["area_id"] or ""),
                    "device": m.get("device"),
                }
                for m in g["members"]
            ],
        }
        for g in groups
    ]
    return f"""Task: duplicates.
Each group lists entities from different integrations that may be the SAME physical thing (e.g. a light switched by
one system through a relay of another). Evidence "history" = they switched at the same moments ("together" of "of"
times); "name" = similar name in the same room.
For each group: is it the same physical thing? If yes, which entity should the voice assistant use (the one
people would call it by; usually the real light/cover over a relay, the readable name over a technical one)?
Answer: {{"groups": [{{"key": "...", "same": true, "primary": "entity_id", "reason": "...", "confidence": 0.5}}]}}
Data:
{_dump(items)}"""


def parse_duplicates(data: dict, groups: list[dict]) -> dict[str, dict]:
    by_key = {g["key"]: g for g in groups}
    out = {}
    for g in data.get("groups") or []:
        if not isinstance(g, dict) or g.get("key") not in by_key:
            continue
        ids = {m["entity_id"] for m in by_key[g["key"]]["members"]}
        same = bool(g.get("same"))
        primary = g.get("primary") if g.get("primary") in ids else None
        out[g["key"]] = {
            "same": same,
            "primary": primary if same else None,
            "reason": _reason(g.get("reason")),
            "confidence": _conf(g.get("confidence")),
        }
    return out


# --- orphans ----------------------------------------------------------------


def orphans_task(groups: list[dict]) -> str:
    items = [
        {
            "integration": g["integration"],
            "integration_running": g["running"],
            "count": len(g["entities"]),
            "device_still_reports": sum(1 for e in g["entities"] if e["device_live"]),
            "examples": [e["entity_id"] for e in g["entities"][:12]],
        }
        for g in groups
    ]
    return f"""Task: orphaned entities.
These entities are currently not provided by their integration. That can mean: really gone (removed device or
removed YAML package), or only offline right now (device switched off, tablet away, accessory unplugged), or
created only while a device reports. "device_still_reports" counts entities whose device still sends other values.
For each integration: "remove" (clearly leftovers), "keep" (most likely only offline or on demand) or "check".
Answer: {{"groups": [{{"integration": "...", "advice": "remove", "reason": "...", "confidence": 0.5}}]}}
Data:
{_dump(items)}"""


def parse_orphans(data: dict, groups: list[dict]) -> dict[str, dict]:
    known = {g["integration"] for g in groups}
    out = {}
    for g in data.get("groups") or []:
        if not isinstance(g, dict) or g.get("integration") not in known:
            continue
        advice = g.get("advice") if g.get("advice") in ("remove", "keep", "check") else "check"
        out[g["integration"]] = {
            "advice": advice,
            "reason": _reason(g.get("reason")),
            "confidence": _conf(g.get("confidence")),
        }
    return out


# --- silent devices -----------------------------------------------------------


def silent_task(devices: list[dict]) -> str:
    items = [
        {
            "device_id": d["device_id"],
            "name": d["name"],
            "model": d["model"],
            "integration": d["integration"],
            "kind": d["kind"],
            "room": d["area"],
            "entities": d["entities"],
            "deletable": d["deletable"],
        }
        for d in devices
    ]
    return f"""Task: silent devices.
These devices report nothing right now. For each: "keep" (probably only switched off or asleep, e.g. a tablet or
printer), "check" (should report – e.g. a lock, smoke detector or heating; maybe battery or connection), "disable"
(probably not used any more; reversible) or "delete" (clearly gone; only if "deletable" is true).
Answer: {{"devices": [{{"device_id": "...", "advice": "keep", "reason": "...", "confidence": 0.5}}]}}
Data:
{_dump(items)}"""


def parse_silent(data: dict, devices: list[dict]) -> dict[str, dict]:
    by_id = {d["device_id"]: d for d in devices}
    out = {}
    for d in data.get("devices") or []:
        if not isinstance(d, dict) or d.get("device_id") not in by_id:
            continue
        advice = d.get("advice") if d.get("advice") in ("keep", "check", "disable", "delete") else "check"
        if advice == "delete" and not by_id[d["device_id"]]["deletable"]:
            advice = "disable"
        out[d["device_id"]] = {
            "advice": advice,
            "reason": _reason(d.get("reason")),
            "confidence": _conf(d.get("confidence")),
        }
    return out


# --- what a switch drives ---------------------------------------------------------


def switches_task(switches: list[dict]) -> str:
    return f"""Task: what does each switch drive?
Each item is a switch entity whose kind is unclear. Decide what it most likely switches, from its name, device,
model and room: one of {", ".join(SWITCH_KINDS)} ("switch" = something else or unclear).
Answer: {{"switches": [{{"entity_id": "...", "kind": "light", "reason": "...", "confidence": 0.5}}]}}
Data:
{_dump(switches)}"""


def parse_switches(data: dict, switches: list[dict]) -> dict[str, dict]:
    known = {s["entity_id"] for s in switches}
    out = {}
    for s in data.get("switches") or []:
        if not isinstance(s, dict) or s.get("entity_id") not in known:
            continue
        kind = s.get("kind") if s.get("kind") in SWITCH_KINDS else "switch"
        if kind == "switch":
            continue  # nothing to show
        out[s["entity_id"]] = {
            "kind": kind,
            "reason": _reason(s.get("reason")),
            "confidence": _conf(s.get("confidence")),
        }
    return out


# --- functions: what is the device, which status for each function ---------------

FUNCTION_STATUSES = ("assistant", "ha", "hidden", "disabled")


def functions_task(devices: list[dict], language: str) -> str:
    return f"""Task: what is each device, and which status should each of its functions get.
Statuses go in one direction; each includes the ones before:
- "assistant": the voice assistant may use it – things people switch or ask about by voice: lights, covers,
  climate, locks, sockets with a clear purpose, room temperature and humidity, door/window state.
- "ha": stays visible in Home Assistant, not for the voice assistant: energy, power, voltage, settings.
- "hidden": hidden in Home Assistant but still recorded: diagnostic values someone may need later.
- "disabled": switched off, no data at all: pure telemetry nobody needs (signal strength, uptime, IP, firmware,
  fast counters). Never "disabled" when "used_in" > 0 (automations or scripts use it).
"writes_per_day" = rows it adds to the database per day (high = costly). "technical" = diagnostic/config value.
Be conservative: keep the current status when unsure. Reason: at most 12 words, concrete.
"what": one or two sentences in the language "{language}": what the device is and what it does, only from
the data (manufacturer, model, integration, functions).
Answer: {{"devices": [{{"device_id": "...", "what": "...", "functions": [{{"entity_id": "...", "status": "ha", "reason": "..."}}]}}]}}
Data:
{_dump(devices)}"""


def parse_functions(data: dict, devices: list[dict]) -> dict[str, dict]:
    """Per device: its explanation and a checked status suggestion per function."""
    by_id = {d["device_id"]: d for d in devices}
    out = {}
    for d in data.get("devices") or []:
        if not isinstance(d, dict) or d.get("device_id") not in by_id:
            continue
        known = {f["entity_id"]: f for f in by_id[d["device_id"]]["functions"]}
        functions = {}
        for f in d.get("functions") or []:
            if not isinstance(f, dict) or f.get("entity_id") not in known:
                continue
            wanted = f.get("status")
            if wanted not in FUNCTION_STATUSES:
                continue
            if wanted == "disabled" and known[f["entity_id"]].get("used_in"):
                wanted = "hidden"  # something uses it: never switch it off
            functions[f["entity_id"]] = {"status": wanted, "reason": _reason(f.get("reason"))}
        out[d["device_id"]] = {"what": str(d.get("what") or "").strip()[:300], "functions": functions}
    return out
