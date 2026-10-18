"""Read floors, areas, devices and entities into a plain inventory."""

from __future__ import annotations

from typing import Any

from homeassistant.components.homeassistant.exposed_entities import async_should_expose
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import (
    area_registry as ar,
)
from homeassistant.helpers import (
    device_registry as dr,
)
from homeassistant.helpers import (
    entity_registry as er,
)
from homeassistant.helpers import (
    floor_registry as fr,
)

from .const import ASSISTANT

# Since HA 2026.x entity aliases are an ordered list that may contain a marker
# for the entity's own name. Older versions use a plain set of strings.
COMPUTED_NAME = getattr(er, "COMPUTED_NAME", None)


def alias_strings(aliases: Any) -> list[str]:
    """The spoken aliases only, without the computed-name marker."""
    return [a for a in aliases or () if isinstance(a, str)]


def build_aliases(current: Any, wanted: list[str]) -> Any:
    """New registry value: keep the computed-name marker, replace the strings."""
    if isinstance(current, (set, frozenset)):
        return set(wanted)
    markers = [a for a in current or () if not isinstance(a, str)]
    return [*markers, *wanted]


def serialize_aliases(aliases: Any) -> list[str | None]:
    return [a if isinstance(a, str) else None for a in aliases or ()]


def deserialize_aliases(current: Any, stored: list[str | None]) -> Any:
    if isinstance(current, (set, frozenset)):
        return {a for a in stored if a is not None}
    return [COMPUTED_NAME if a is None else a for a in stored]


def device_entries(dev_reg: dr.DeviceRegistry) -> list[dr.DeviceEntry]:
    """All devices, without the accessors HA deprecates (it used to be a mapping by id)."""
    items = list(dev_reg.devices)
    if items and isinstance(items[0], str):
        return [dev_reg.async_get(device_id) for device_id in items]
    return items


def device_entry_id(dev: dr.DeviceEntry) -> str | None:
    """The device's config entry; HA 2026.x has exactly one, older versions a set."""
    if (entry_id := getattr(dev, "config_entry_id", None)) is not None:
        return entry_id
    return getattr(dev, "primary_config_entry", None) or next(iter(getattr(dev, "config_entries", ())), None)


@callback
def build_inventory(hass: HomeAssistant) -> dict[str, Any]:
    """Snapshot of the registries in the shape rules.py expects."""
    floor_reg = fr.async_get(hass)
    area_reg = ar.async_get(hass)
    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)

    def entry_info(entry_id: str | None) -> tuple[str | None, bool]:
        entry = hass.config_entries.async_get_entry(entry_id) if entry_id else None
        if entry is None:
            return None, True
        return entry.domain, entry.state is ConfigEntryState.LOADED

    floors = {
        f.floor_id: {
            "floor_id": f.floor_id,
            "name": f.name,
            "level": f.level,
            "aliases": sorted(f.aliases),
        }
        for f in floor_reg.async_list_floors()
    }
    areas = {
        a.id: {
            "area_id": a.id,
            "name": a.name,
            "floor_id": a.floor_id,
            "aliases": sorted(a.aliases),
        }
        for a in area_reg.async_list_areas()
    }

    devices: dict[str, dict] = {}
    for dev in device_entries(dev_reg):
        if dev.disabled_by:
            continue
        domain, entry_ok = entry_info(device_entry_id(dev))
        devices[dev.id] = {
            "device_id": dev.id,
            "name": dev.name_by_user or dev.name,
            "name_by_user": dev.name_by_user,
            "default_name": dev.name,
            "manufacturer": dev.manufacturer,
            "model": dev.model,
            "area_id": dev.area_id,
            "integration": domain,
            "entry_ok": entry_ok,
            "service": dev.entry_type is dr.DeviceEntryType.SERVICE,
            "entity_ids": [],
        }

    entities: dict[str, dict] = {}
    for ent in ent_reg.entities.values():
        if ent.disabled_by:
            continue
        state = hass.states.get(ent.entity_id)
        _, entry_ok = entry_info(ent.config_entry_id)
        entities[ent.entity_id] = {
            "entity_id": ent.entity_id,
            "domain": ent.domain,
            "device_id": ent.device_id if ent.device_id in devices else None,
            "name": ent.name,
            "original_name": ent.original_name,
            "title": state.name if state else (ent.name or ent.original_name or ent.entity_id),
            "area_id": ent.area_id,
            "entity_category": ent.entity_category.value if ent.entity_category else None,
            "hidden": ent.hidden_by is not None,
            "device_class": ent.device_class or ent.original_device_class,
            "aliases": alias_strings(ent.aliases),
            "exposed": async_should_expose(hass, ASSISTANT, ent.entity_id),
            "restored": bool(state and state.attributes.get("restored")),
            # groups (HA groups, light groups, Hue rooms …) list their members
            "is_group": bool(state and isinstance(state.attributes.get("entity_id"), (list, tuple))),
            "available": state is not None and state.state != "unavailable",
            "platform": ent.platform,
            "entry_ok": entry_ok,
        }
        if ent.device_id in devices:
            devices[ent.device_id]["entity_ids"].append(ent.entity_id)

    for dev in devices.values():
        dev["entity_ids"].sort()

    return {"floors": floors, "areas": areas, "devices": devices, "entities": entities}
