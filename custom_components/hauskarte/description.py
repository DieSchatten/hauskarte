"""House map: room layout, devices per room and a text description for language models.

Pure functions on the plain inventory (see inventory.py).

Every floor shares one grid (GRID_COLUMNS wide), so a room drawn at the same place one
floor up lies above it. Positions are only known for rooms the user has placed.
"""

from __future__ import annotations

from typing import Any

from .kinds import PRIORITY, device_kind, entity_kind

GRID_COLUMNS = 24
DEFAULT_ROWS = 14

TEXT = {
    "de": {
        "floors": "Aufbau des Hauses (von oben nach unten):",
        "no_floor": "Ohne Etage",
        "also": "auch",
        "up_down": "„Oben“ meint {up}, „unten“ {down}.",
        "below": "Darunter: {below}.",
        "layout": "Lage der Räume:",
        "next_to": "{room} grenzt an {others}.",
        "above": "{room} liegt über {others}.",
        "speakers": "Sprachgeräte: {list}. Wer über ein Sprachgerät spricht, ist in dessen Raum.",
        "notes": "Hinweise:",
        "groups": "Raumgruppen (Räume, die offen ineinander übergehen):",
        "group": "{name} = {rooms} (wer „{name}“ sagt, meint alle diese Räume)",
        "and": " und ",
        "house": "Allgemein",
    },
    "en": {
        "floors": "Layout of the house (top to bottom):",
        "no_floor": "No floor",
        "also": "also",
        "up_down": "“Upstairs” means {up}, “downstairs” {down}.",
        "below": "Below: {below}.",
        "layout": "Where rooms are:",
        "next_to": "{room} is next to {others}.",
        "above": "{room} is above {others}.",
        "speakers": "Voice devices: {list}. Whoever speaks through a voice device is in its room.",
        "notes": "Notes:",
        "groups": "Room groups (rooms that open into each other):",
        "group": "{name} = {rooms} (saying “{name}” means all of them)",
        "and": " and ",
        "house": "General",
    },
}

HOUSE_NOTE = "_house"

# Readings rather than things: shown as values at the edge of the map, not as symbols in the room.
SENSOR_KINDS = {"temperature", "humidity", "energy", "battery", "sensor", "contact", "motion", "alarm"}
# Shown even when not exposed to the assistant; plain readings only when exposed (avoids technical noise).
SENSOR_ALWAYS = ["temperature", "humidity", "contact", "motion", "alarm"]
SENSOR_ORDER = [*SENSOR_ALWAYS, "energy", "sensor"]
MAX_SENSORS = 12


def _text(language: str) -> dict[str, str]:
    return TEXT["de" if (language or "").lower().startswith("de") else "en"]


def _join(items: list[str], t: dict) -> str:
    if len(items) <= 1:
        return "".join(items)
    return ", ".join(items[:-1]) + t["and"] + items[-1]


def floors_top_down(inv: dict) -> list[dict]:
    return sorted(
        inv["floors"].values(),
        key=lambda f: (f.get("level") is None, -(f.get("level") or 0), f["name"]),
    )


def rooms_of(inv: dict, floor_id: str | None) -> list[dict]:
    rooms = [a for a in inv["areas"].values() if (a.get("floor_id") or None) == floor_id]
    return sorted(rooms, key=lambda a: a["name"].lower())


def speaker_devices(inv: dict) -> list[dict]:
    """Devices with a voice satellite entity."""
    result = []
    for dev in inv["devices"].values():
        if any(inv["entities"][e]["domain"] == "assist_satellite" for e in dev["entity_ids"]):
            result.append(dev)
    return result


def _rect(layout: dict, area_id: str) -> tuple[int, int, int, int] | None:
    pos = layout.get(area_id)
    if not isinstance(pos, dict):
        return None
    try:
        return int(pos["x"]), int(pos["y"]), max(1, int(pos["w"])), max(1, int(pos["h"]))
    except (KeyError, TypeError, ValueError):
        return None


def _overlap(a0: int, a1: int, b0: int, b1: int) -> int:
    return min(a1, b1) - max(a0, b0)


def touching(a: tuple, b: tuple) -> bool:
    """Rectangles share a piece of an edge (corners alone do not count)."""
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    if (ax + aw == bx or bx + bw == ax) and _overlap(ay, ay + ah, by, by + bh) > 0:
        return True
    return (ay + ah == by or by + bh == ay) and _overlap(ax, ax + aw, bx, bx + bw) > 0


def covering(a: tuple, b: tuple) -> bool:
    """Rectangles overlap in area (used across floors)."""
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    return _overlap(ax, ax + aw, bx, bx + bw) > 0 and _overlap(ay, ay + ah, by, by + bh) > 0


def neighbours(inv: dict, layout: dict) -> tuple[dict[str, list[str]], dict[str, list[str]]]:
    """(next_to, above) as area_id → area_ids, each pair listed once."""
    next_to: dict[str, list[str]] = {}
    above: dict[str, list[str]] = {}
    floors = inv["floors"]
    placed = [(a, _rect(layout, a["area_id"])) for a in inv["areas"].values()]
    placed = sorted([(a, r) for a, r in placed if r], key=lambda p: p[0]["name"].lower())
    for i, (a, ra) in enumerate(placed):
        for b, rb in placed[i + 1 :]:
            if a.get("floor_id") == b.get("floor_id") and touching(ra, rb):
                next_to.setdefault(a["area_id"], []).append(b["area_id"])
    for a, ra in placed:
        fa = floors.get(a.get("floor_id") or "")
        if fa is None or fa.get("level") is None:
            continue
        for b, rb in placed:
            fb = floors.get(b.get("floor_id") or "")
            if fb is not None and fb.get("level") == fa["level"] - 1 and covering(ra, rb):
                above.setdefault(a["area_id"], []).append(b["area_id"])
    return next_to, above


def build_description(
    inv: dict, layout: dict, notes: dict, language: str, groups: list[dict] | None = None
) -> str:
    """Compact, stable text for a conversation agent's instructions."""
    t = _text(language)
    areas = inv["areas"]

    def room(area: dict) -> str:
        aliases = area.get("aliases") or []
        return area["name"] + (f" ({t['also']}: {', '.join(aliases)})" if aliases else "")

    lines = [t["floors"]]
    for floor in floors_top_down(inv):
        rooms = rooms_of(inv, floor["floor_id"])
        lines.append(f"- {floor['name']}: {', '.join(room(a) for a in rooms) or '–'}")
    if loose := rooms_of(inv, None):
        lines.append(f"- {t['no_floor']}: {', '.join(room(a) for a in loose)}")

    levels = [f for f in inv["floors"].values() if f.get("level") is not None]
    ground = [f["name"] for f in levels if f["level"] == 0]
    up = [f["name"] for f in sorted(levels, key=lambda f: f["level"]) if f["level"] > 0]
    below = [f["name"] for f in sorted(levels, key=lambda f: -f["level"]) if f["level"] < 0]
    if ground and up:
        lines.append(t["up_down"].format(up=_join(up, t), down=ground[0]))
    if ground and below:
        lines.append(t["below"].format(below=_join(below, t)))

    next_to, above = neighbours(inv, layout)
    if next_to or above:
        lines.append(t["layout"])
        for area_id, others in next_to.items():
            names = [areas[o]["name"] for o in others]
            lines.append("- " + t["next_to"].format(room=areas[area_id]["name"], others=_join(names, t)))
        for area_id, others in above.items():
            names = sorted(areas[o]["name"] for o in others)
            lines.append("- " + t["above"].format(room=areas[area_id]["name"], others=_join(names, t)))

    group_lines = []
    for g in sorted(groups or [], key=lambda g: g["name"].lower()):
        names = sorted(areas[a]["name"] for a in g["area_ids"] if a in areas)
        if names:
            group_lines.append("- " + t["group"].format(name=g["name"], rooms=_join(names, t)))
    if group_lines:
        lines.append(t["groups"])
        lines.extend(group_lines)

    speakers = []
    for dev in sorted(speaker_devices(inv), key=lambda d: (d.get("name") or "").lower()):
        if dev.get("area_id") in areas:
            speakers.append(f"{areas[dev['area_id']]['name']} ({dev.get('name')})")
    if speakers:
        lines.append(t["speakers"].format(list="; ".join(speakers)))

    note_lines = [
        f"- {areas[a]['name']}: {text.strip()}"
        for a, text in sorted(notes.items(), key=lambda n: n[0])
        if a in areas and isinstance(text, str) and text.strip()
    ]
    if isinstance(notes.get(HOUSE_NOTE), str) and notes[HOUSE_NOTE].strip():
        note_lines.append(f"- {t['house']}: {notes[HOUSE_NOTE].strip()}")
    if note_lines:
        lines.append(t["notes"])
        lines.extend(note_lines)
    return "\n".join(lines)


def map_id(prop_or_item: dict) -> str:
    """Key of a device (device_id) or a device-less entity (entity_id) on the map."""
    return prop_or_item["id"].split(":", 1)[-1]


def _pin(item: dict, pins: dict, shown: dict) -> dict:
    item["pos"] = pins.get(item["id"])
    # Shown unless chosen otherwise: everything the assistant may use, and voice devices.
    item["visible"] = shown.get(item["id"], item["exposed"] or item["speaker"])
    return item


def _rank(kind: str) -> int:
    return PRIORITY.index(kind) if kind in PRIORITY else len(PRIORITY)


def _device_item(inv: dict, dev: dict, speakers: set[str], open_ids: set[str]) -> dict[str, Any]:
    ents = [inv["entities"][e] for e in dev["entity_ids"]]
    useful = [e for e in ents if not e.get("entity_category")]
    # the entity that stands for the device: tapping the symbol switches it, its state colours the symbol
    main = min(useful, key=lambda e: _rank(entity_kind(e, dev.get("name"))), default=None)
    what = device_kind(inv, dev)
    return {
        "id": dev["device_id"],
        "entity_id": main["entity_id"] if main else None,
        "physical": what not in SENSOR_KINDS,
        "what": what,
        "kind": "device",
        "name": dev.get("name") or dev.get("model") or dev["device_id"],
        "domain": main["domain"] if main else None,
        "exposed": any(e.get("exposed") for e in ents),
        "speaker": dev["device_id"] in speakers,
        "open": f"device:{dev['device_id']}" in open_ids,
    }


def _room_sensors(inv: dict) -> dict[str, list[dict]]:
    """Readings per room, most telling first: temperature, humidity, windows/doors, motion …"""
    result: dict[str, list[dict]] = {}
    for ent in inv["entities"].values():
        if ent.get("entity_category") or ent.get("hidden") or ent.get("restored"):
            continue
        dev = inv["devices"].get(ent.get("device_id") or "")
        area_id = ent.get("area_id") or (dev.get("area_id") if dev else None)
        if area_id not in inv["areas"]:
            continue
        kind = entity_kind(ent, dev.get("name") if dev else None)
        if kind not in SENSOR_ORDER or (kind not in SENSOR_ALWAYS and not ent.get("exposed")):
            continue
        result.setdefault(area_id, []).append(
            {"entity_id": ent["entity_id"], "name": ent.get("title") or ent["entity_id"], "what": kind}
        )
    for items in result.values():
        items.sort(key=lambda s: (SENSOR_ORDER.index(s["what"]), s["name"].lower()))
    return result


def _counts(devices: list[dict]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for d in devices:
        if d["visible"]:
            counts[d["what"]] = counts.get(d["what"], 0) + 1
    return counts


def build_map(
    inv: dict,
    layout: dict,
    notes: dict,
    open_ids: set[str],
    plans: dict | None = None,
    pins: dict | None = None,
    shown: dict | None = None,
    merged: dict | None = None,
    icons: dict | None = None,
    groups: list[dict] | None = None,
) -> dict[str, Any]:
    """Data for the map view of the panel."""
    pins = pins or {}
    icons = icons or {}
    shown = shown or {}
    # entity_id of a merged primary → integrations of the twins it stands for
    twins = {
        m["primary"]: sorted({x["platform"] for x in m["members"] if x["entity_id"] != m["primary"]})
        for m in (merged or {}).values()
    }
    speakers = {d["device_id"] for d in speaker_devices(inv)}
    items: dict[str, list[dict]] = {a: [] for a in inv["areas"]}
    unassigned: list[dict] = []
    for dev in inv["devices"].values():
        if not dev["entity_ids"]:
            continue
        item = _pin(_device_item(inv, dev, speakers, open_ids), pins, shown)
        item["icon"] = icons.get(item["id"])
        item["twins"] = sorted({p for e in dev["entity_ids"] for p in twins.get(e, [])})
        if dev.get("area_id") in items:
            items[dev["area_id"]].append(item)
        elif not dev.get("service") and item["visible"]:
            unassigned.append(item)
    for ent in inv["entities"].values():
        if ent.get("device_id") is not None:
            continue
        item = {
            "id": ent["entity_id"],
            "entity_id": ent["entity_id"],
            "physical": entity_kind(ent) not in SENSOR_KINDS,
            "what": entity_kind(ent),
            "kind": "entity",
            "name": ent.get("title") or ent["entity_id"],
            "domain": ent["domain"],
            "exposed": bool(ent.get("exposed")),
            "speaker": False,
            "open": f"entity:{ent['entity_id']}" in open_ids,
        }
        item["twins"] = twins.get(ent["entity_id"], [])
        item["icon"] = icons.get(item["id"])
        if ent.get("area_id") in items and (item["exposed"] or shown.get(item["id"])):
            items[ent["area_id"]].append(_pin(item, pins, shown))
    plans = plans or {}

    def floor_info(floor_id: str | None, name: str, level: int | None) -> dict:
        plan = plans.get(floor_id or "") or {}
        return {
            "floor_id": floor_id,
            "name": name,
            "level": level,
            "rows": int(plan.get("rows") or DEFAULT_ROWS),
            "image": plan.get("version") if plan.get("image") else None,
            "detected": plan.get("detected") or [],
        }

    floors = [floor_info(f["floor_id"], f["name"], f.get("level")) for f in floors_top_down(inv)]
    if any(not a.get("floor_id") for a in inv["areas"].values()):
        floors.append(floor_info(None, "", None))
    sensors = _room_sensors(inv)
    rooms = []
    for area in inv["areas"].values():
        devices = sorted(items[area["area_id"]], key=lambda d: (not d["speaker"], d["name"].lower()))
        rooms.append(
            {
                "area_id": area["area_id"],
                "name": area["name"],
                "floor_id": area.get("floor_id"),
                "position": dict(zip("xywh", r, strict=True))
                if (r := _rect(layout, area["area_id"]))
                else None,
                "note": notes.get(area["area_id"], ""),
                "devices": devices,
                "counts": _counts(devices),
                "sensors": sensors.get(area["area_id"], [])[:MAX_SENSORS],
            }
        )
    unplaced_speakers = [
        {"id": d["device_id"], "name": d.get("name") or d["device_id"]}
        for d in speaker_devices(inv)
        if d.get("area_id") not in inv["areas"]
    ]
    unassigned.sort(key=lambda d: (not d["speaker"], d["name"].lower()))
    return {
        "columns": GRID_COLUMNS,
        "floors": floors,
        "rooms": sorted(rooms, key=lambda r: r["name"].lower()),
        "house_note": notes.get(HOUSE_NOTE, ""),
        "groups": groups or [],
        "speakers_without_area": unplaced_speakers,
        # devices waiting for a room; dragging one onto a room assigns it
        "unassigned": unassigned[:300],
        "unassigned_total": len(unassigned),
    }
