"""Hauskarte: proposals for areas, names and assistant exposure, reviewed by click."""

from __future__ import annotations

import hashlib
from pathlib import Path

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import Event, HomeAssistant, ServiceCall, callback
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import floor_registry as fr
from homeassistant.helpers import label_registry as lr

from . import websocket
from .const import CONF_WATCH, DOMAIN, PANEL_URL, STATIC_URL, WATCH_DELAY
from .manager import HauskarteManager

PLATFORMS = [Platform.SENSOR]
PANEL_JS = Path(__file__).parent / "panel" / "hauskarte-panel.js"

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

_REGISTERED = f"{DOMAIN}_registered"
_STATIC = f"{DOMAIN}_static"


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    return True


async def _async_register_once(hass: HomeAssistant) -> None:
    """Websocket commands and the service live as long as HA."""
    if hass.data.get(_REGISTERED):
        return
    hass.data[_REGISTERED] = True
    websocket.async_register(hass)

    async def scan(call: ServiceCall) -> None:
        if (manager := hass.data.get(DOMAIN)) is not None:
            await manager.async_scan(call.data["use_llm"])

    hass.services.async_register(
        DOMAIN, "scan", scan, schema=vol.Schema({vol.Optional("use_llm", default=True): bool})
    )


async def async_register_panel(hass: HomeAssistant) -> None:
    if not hass.data.get(_STATIC):
        hass.data[_STATIC] = True
        await hass.http.async_register_static_paths(
            [StaticPathConfig(STATIC_URL, str(PANEL_JS.parent), cache_headers=False)]
        )
    # Content hash, so browsers load a new panel right after an update.
    content = await hass.async_add_executor_job(PANEL_JS.read_bytes)
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL,
        webcomponent_name="hauskarte-panel",
        sidebar_title="Hauskarte",
        sidebar_icon="mdi:floor-plan",
        module_url=f"{STATIC_URL}/hauskarte-panel.js?v={hashlib.sha1(content).hexdigest()[:8]}",
        require_admin=True,
    )


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    manager = HauskarteManager(hass, entry)
    await manager.async_load()
    hass.data[DOMAIN] = manager
    await _async_register_once(hass)
    await async_register_panel(hass)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    @callback
    def registry_changed(event: Event) -> None:
        manager.schedule_refresh()

    @callback
    def device_changed(event: Event) -> None:
        manager.schedule_refresh()
        if event.data.get("action") == "create" and manager.options.get(CONF_WATCH, True):
            manager.schedule_rules_scan(WATCH_DELAY)

    for event_type in (
        ar.EVENT_AREA_REGISTRY_UPDATED,
        fr.EVENT_FLOOR_REGISTRY_UPDATED,
        lr.EVENT_LABEL_REGISTRY_UPDATED,
    ):
        entry.async_on_unload(hass.bus.async_listen(event_type, registry_changed))
    entry.async_on_unload(hass.bus.async_listen(dr.EVENT_DEVICE_REGISTRY_UPDATED, device_changed))
    entry.async_on_unload(manager.async_shutdown)
    entry.async_on_unload(entry.add_update_listener(_async_reload))
    return True


async def _async_reload(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    if not await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        return False
    frontend.async_remove_panel(hass, PANEL_URL)
    hass.data.pop(DOMAIN, None)
    return True
