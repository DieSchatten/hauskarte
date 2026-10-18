"""What a thing is for people: light, shading, socket, heating …

Derived from the entity domain, its device class and words in the name (a Shelly relay
called "Licht Flur" is a light). Labels and icons live in the panel; this only names the kind.
"""

from __future__ import annotations

from .rules import normalize

# Words in a name that tell what a switch really drives (normalized: lower case, umlauts folded).
NAME_HINTS: list[tuple[str, tuple[str, ...]]] = [
    (
        "light",
        ("licht", "lampe", "leuchte", "beleuchtung", "spot", "strahler", "led", "light", "lamp", "deckenl"),
    ),
    (
        "shading",
        (
            "rollo",
            "rolladen",
            "rollladen",
            "jalousie",
            "markise",
            "beschattung",
            "raffstore",
            "blind",
            "shutter",
        ),
    ),
    ("socket", ("steckdose", "plug", "socket", "outlet")),
    ("heating", ("heizung", "thermostat", "fussbodenheizung", "heizkoerper", "heating", "klima")),
    ("fan", ("luefter", "ventilator", "lueftung", "fan")),
    ("water", ("pumpe", "bewaesserung", "brunnen", "ventil", "pump", "irrigation")),
]

CONTACT_CLASSES = {"door", "garage_door", "opening", "window"}
MOTION_CLASSES = {"motion", "occupancy", "presence", "moving"}
ALARM_CLASSES = {"smoke", "gas", "moisture", "safety", "problem", "carbon_monoxide", "tamper", "vibration"}
ENERGY_CLASSES = {"power", "energy", "current", "voltage", "apparent_power", "reactive_power", "power_factor"}

DOMAIN_KIND = {
    "light": "light",
    "climate": "heating",
    "water_heater": "heating",
    "humidifier": "heating",
    "fan": "fan",
    "valve": "water",
    "lock": "lock",
    "media_player": "media",
    "assist_satellite": "voice",
    "camera": "camera",
    "vacuum": "vacuum",
    "lawn_mower": "garden",
    "scene": "scene",
    "script": "script",
    "automation": "automation",
    "weather": "weather",
    "todo": "list",
    "person": "presence",
    "device_tracker": "presence",
    "button": "button",
    "number": "setting",
    "select": "setting",
    "input_number": "setting",
    "input_select": "setting",
    "input_boolean": "switch",
    "update": "update",
    "alarm_control_panel": "alarm",
    "siren": "alarm",
}

# When a device has several entities, the one that best says what the device is.
PRIORITY = [
    "voice", "light", "shading", "window", "door", "heating", "lock", "media", "camera", "vacuum",
    "socket", "switch", "fan", "water", "garden", "alarm", "contact", "motion", "temperature",
    "humidity", "energy", "battery", "sensor", "scene", "script", "setting", "button", "presence",
    "weather", "list", "automation", "update", "other",
]  # fmt: skip


def _hint(*names: str | None) -> str | None:
    text = " ".join(normalize(n) for n in names if n)
    if not text:
        return None
    words = text.split()
    for kind, hints in NAME_HINTS:
        if any(w.startswith(h) or h in w for w in words for h in hints):
            return kind
    return None


def entity_kind(ent: dict, device_name: str | None = None) -> str:
    if ent.get("kind_override"):
        return ent["kind_override"]  # chosen by the user (e.g. from the AI review)
    domain = ent["domain"]
    device_class = ent.get("device_class")
    if domain == "switch":
        if device_class == "outlet":
            return "socket"
        return _hint(ent.get("title"), ent.get("name"), ent.get("original_name"), device_name) or "switch"
    if domain == "cover":
        if device_class in ("garage", "gate", "door"):
            return "door"
        if device_class == "window":
            return "window"
        if device_class == "damper":
            return "heating"
        return "shading"  # awning, blind, curtain, shade, shutter or not set
    if domain == "binary_sensor":
        if device_class in CONTACT_CLASSES:
            return "contact"
        if device_class in MOTION_CLASSES:
            return "motion"
        if device_class in ALARM_CLASSES:
            return "alarm"
        if device_class == "battery":
            return "battery"
        return "sensor"
    if domain == "sensor":
        if device_class == "temperature":
            return "temperature"
        if device_class == "humidity":
            return "humidity"
        if device_class in ENERGY_CLASSES:
            return "energy"
        if device_class == "battery":
            return "battery"
        return "sensor"
    return DOMAIN_KIND.get(domain, "other")


def device_kind(inv: dict, dev: dict) -> str:
    """The kind that best describes a device, from its useful entities."""
    kinds = [
        entity_kind(inv["entities"][e], dev.get("name"))
        for e in dev["entity_ids"]
        if not inv["entities"][e].get("entity_category")
    ]
    if not kinds:
        return "other"
    return min(kinds, key=lambda k: PRIORITY.index(k) if k in PRIORITY else len(PRIORITY))
