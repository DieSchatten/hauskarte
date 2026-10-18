"""House description as a sensor, for use in a conversation agent's instructions.

{{ state_attr('sensor.hauskarte_beschreibung', 'text') }}
"""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DOMAIN, SENSOR_UNIQUE_ID, SIGNAL_CHANGED
from .manager import HauskarteManager


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    async_add_entities([HouseDescriptionSensor(hass.data[DOMAIN])])


class HouseDescriptionSensor(SensorEntity):
    """State: number of rooms. Attribute `text`: the description."""

    _attr_has_entity_name = True
    _attr_translation_key = "house_description"
    _attr_unique_id = SENSOR_UNIQUE_ID
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_should_poll = False
    # The text can be long and changes rarely; keep it out of the database.
    _unrecorded_attributes = frozenset({"text"})

    def __init__(self, manager: HauskarteManager) -> None:
        self._manager = manager
        self.entity_id = "sensor.hauskarte_beschreibung"
        self._text = ""
        self._rooms = 0

    async def async_added_to_hass(self) -> None:
        self._refresh()
        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL_CHANGED, self._handle_change))

    @callback
    def _refresh(self) -> None:
        self._text = self._manager.description_text()
        self._rooms = len(ar.async_get(self.hass).async_list_areas())

    @callback
    def _handle_change(self) -> None:
        self._refresh()
        self.async_write_ha_state()

    @property
    def native_value(self) -> int:
        return self._rooms

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"text": self._text}
