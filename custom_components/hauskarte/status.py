"""One status per function (entity), in one direction only.

    assistant → ha → hidden → disabled

Every step includes the ones before it: what HA hides, the assistant does not get; what is disabled sends
no data at all. Pure helpers here; the manager writes the registries.
"""

from __future__ import annotations

ASSISTANT = "assistant"  # the voice assistant sees and controls it; visible in HA; records data
HA = "ha"  # only in HA: visible, records data, not for the assistant
HIDDEN = "hidden"  # hidden in HA (dashboards, area cards); still records data, automations keep working
DISABLED = "disabled"  # off: no state, no data in the database

STATUSES = (ASSISTANT, HA, HIDDEN, DISABLED)
RANK = {s: i for i, s in enumerate(STATUSES)}

CONTROL = "control"  # does something: switches, dims, moves, sets
MEASURE = "measure"  # reports something: a value or a state
TECHNICAL = "technical"  # diagnostic or configuration value of the device itself
OTHER = "other"

CONTROL_DOMAINS = {
    "alarm_control_panel", "button", "climate", "cover", "fan", "humidifier", "input_boolean", "input_button",
    "input_number", "input_select", "lawn_mower", "light", "lock", "media_player", "number", "remote", "scene",
    "script", "select", "siren", "switch", "text", "vacuum", "valve", "water_heater",
}  # fmt: skip
MEASURE_DOMAINS = {
    "binary_sensor", "camera", "device_tracker", "event", "image", "person", "sensor", "weather",
}  # fmt: skip

# Turned off far more often than they are wanted, and they write a lot.
WRITES_BUSY = 500  # state rows per day from which an entity counts as busy


def entity_status(exposed: bool, hidden: bool, disabled: bool) -> str:
    """The status of an entity as the registries describe it. Hidden wins over exposed."""
    if disabled:
        return DISABLED
    if hidden:
        return HIDDEN
    return ASSISTANT if exposed else HA


def role(domain: str, category: str | None) -> str:
    if category:
        return TECHNICAL
    if domain in CONTROL_DOMAINS:
        return CONTROL
    if domain in MEASURE_DOMAINS:
        return MEASURE
    return OTHER


def device_status(functions: list[dict]) -> str | None:
    """The most visible status among the device's own functions (technical ones only if there are no others)."""
    main = [f for f in functions if not f.get("technical")] or functions
    if not main:
        return None
    return min((f["status"] for f in main), key=RANK.__getitem__)


def targets_for_device(functions: list[dict], wanted: str) -> dict[str, str]:
    """What each function becomes when the whole device is set to `wanted`.

    The device status is a ceiling: nothing stays more visible than the device. Raising to "assistant" only
    raises the device's own functions – diagnostic values never go to the assistant on their own.
    "disabled" is not handled here: the manager disables the device itself (as HA's own "disable device").
    """
    result = {}
    for f in functions:
        current = f["status"]
        if wanted == ASSISTANT:
            if not f.get("technical") and current != ASSISTANT:
                result[f["entity_id"]] = ASSISTANT
        elif wanted == HA:
            if RANK[current] < RANK[HA] or (not f.get("technical") and current in (HIDDEN, DISABLED)):
                result[f["entity_id"]] = HA
        elif wanted == HIDDEN and RANK[current] < RANK[HIDDEN]:
            result[f["entity_id"]] = HIDDEN
    return result
