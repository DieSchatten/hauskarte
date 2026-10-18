"""Websocket commands for the panel."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError

from .const import DOMAIN, STATUS_IGNORED, STATUS_LATER, STATUS_OPEN
from .manager import HauskarteManager


def _manager(hass: HomeAssistant) -> HauskarteManager | None:
    return hass.data.get(DOMAIN)


@callback
def async_register(hass: HomeAssistant) -> None:
    for command in (
        ws_state,
        ws_scan,
        ws_apply,
        ws_apply_safe,
        ws_decide,
        ws_undo,
        ws_position,
        ws_note,
        ws_floor_plan,
        ws_floor_image,
        ws_remove_floor_image,
        ws_detect_plan,
        ws_discard_detected,
        ws_place_rooms,
        ws_create_floor,
        ws_place_item,
        ws_item_visible,
        ws_remove_orphans,
        ws_device_disabled,
        ws_merge,
        ws_unmerge,
        ws_not_duplicate,
        ws_floor_update,
        ws_area_update,
        ws_area_create,
        ws_device_area,
        ws_ai_review,
        ws_apply_floor_plan,
        ws_kind_override,
        ws_wizard,
        ws_device_areas,
        ws_item_icon,
        ws_area_references,
        ws_merge_areas,
        ws_group_create,
        ws_group_update,
        ws_group_delete,
        ws_group_convert_preview,
        ws_group_convert,
    ):
        websocket_api.async_register_command(hass, command)


def _run(hass: HomeAssistant, connection, msg, func) -> None:
    manager = _manager(hass)
    if manager is None:
        connection.send_error(msg["id"], "not_loaded", "Hauskarte is not set up")
        return
    try:
        result: Any = func(manager)
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "failed", str(err))
        return
    connection.send_result(msg["id"], result)


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "hauskarte/state"})
@callback
def ws_state(hass, connection, msg) -> None:
    def state(m: HauskarteManager) -> dict:
        m.mark_seen()
        return m.snapshot()

    _run(hass, connection, msg, state)


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "hauskarte/scan", vol.Optional("use_llm", default=True): bool}
)
@callback
def ws_scan(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: {"started": m.start_scan(msg["use_llm"])})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/apply",
        vol.Required("proposal_id"): str,
        vol.Required("values"): {
            vol.Optional("area_id"): vol.Any(str, None),
            vol.Optional("name"): vol.Any(str, None),
            vol.Optional("on_map"): bool,
            vol.Optional("entities"): {
                str: {
                    vol.Optional("exposed"): bool,
                    vol.Optional("aliases"): [str],
                    vol.Optional("remove"): bool,
                }
            },
        },
    }
)
@callback
def ws_apply(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.apply(msg["proposal_id"], msg["values"]))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "hauskarte/apply_safe", vol.Optional("ids"): [str]})
@callback
def ws_apply_safe(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.apply_safe(msg.get("ids")))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/decide",
        vol.Required("proposal_id"): str,
        vol.Required("status"): vol.In([STATUS_OPEN, STATUS_LATER, STATUS_IGNORED]),
    }
)
@callback
def ws_decide(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.decide(msg["proposal_id"], msg["status"]))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "hauskarte/undo"})
@callback
def ws_undo(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.undo())


_POSITION = {vol.Required("x"): int, vol.Required("y"): int, vol.Required("w"): int, vol.Required("h"): int}
_FLOOR = vol.Any(str, None)


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/position",
        vol.Required("area_id"): str,
        vol.Required("position"): vol.Any(_POSITION, None),
    }
)
@callback
def ws_position(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.set_position(msg["area_id"], msg["position"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "hauskarte/note", vol.Required("key"): str, vol.Required("text"): str}
)
@callback
def ws_note(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.set_note(msg["key"], msg["text"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/floor_plan",
        vol.Required("floor_id"): _FLOOR,
        vol.Optional("image"): str,
        vol.Optional("rows"): int,
    }
)
@callback
def ws_floor_plan(hass, connection, msg) -> None:
    _run(
        hass, connection, msg, lambda m: m.set_floor_plan(msg["floor_id"], msg.get("image"), msg.get("rows"))
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "hauskarte/floor_image", vol.Required("floor_id"): _FLOOR}
)
@callback
def ws_floor_image(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: {"image": m.floor_image(msg["floor_id"])})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "hauskarte/remove_floor_image", vol.Required("floor_id"): _FLOOR}
)
@callback
def ws_remove_floor_image(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.remove_floor_image(msg["floor_id"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/detect_plan",
        vol.Required("floor_id"): _FLOOR,
        vol.Required("image"): str,
    }
)
@websocket_api.async_response
async def ws_detect_plan(hass, connection, msg) -> None:
    manager = _manager(hass)
    if manager is None:
        connection.send_error(msg["id"], "not_loaded", "Hauskarte is not set up")
        return
    try:
        rooms = await manager.async_detect_plan(msg["floor_id"], msg["image"])
    except HomeAssistantError as err:
        connection.send_error(msg["id"], "failed", str(err))
        return
    connection.send_result(msg["id"], {"rooms": rooms})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "hauskarte/discard_detected", vol.Required("floor_id"): _FLOOR}
)
@callback
def ws_discard_detected(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.discard_detected(msg["floor_id"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/place_rooms",
        vol.Required("floor_id"): _FLOOR,
        vol.Required("rooms"): [
            {
                vol.Optional("area_id"): vol.Any(str, None),
                vol.Optional("name"): vol.Any(str, None),
                **_POSITION,
            }
        ],
        vol.Optional("detected", default=False): bool,
    }
)
@callback
def ws_place_rooms(hass, connection, msg) -> None:
    def place(m: HauskarteManager) -> dict:
        if msg["detected"]:
            return m.accept_detected(msg["floor_id"], msg["rooms"])
        return m.place_rooms(msg["floor_id"], msg["rooms"], msg["rooms"][0].get("name") or "Karte")

    _run(hass, connection, msg, place)


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/create_floor",
        vol.Required("name"): str,
        vol.Optional("level"): vol.Any(int, None),
    }
)
@callback
def ws_create_floor(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: {"floor_id": m.create_floor(msg["name"], msg.get("level"))})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/place_item",
        vol.Required("item_id"): str,
        vol.Required("kind"): vol.In(["device", "entity"]),
        vol.Required("area_id"): str,
        vol.Required("x"): vol.Coerce(float),
        vol.Required("y"): vol.Coerce(float),
    }
)
@callback
def ws_place_item(hass, connection, msg) -> None:
    _run(
        hass,
        connection,
        msg,
        lambda m: m.place_item(msg["item_id"], msg["kind"], msg["area_id"], msg["x"], msg["y"]),
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/item_visible",
        vol.Required("item_id"): str,
        vol.Required("visible"): bool,
    }
)
@callback
def ws_item_visible(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.set_visible(msg["item_id"], msg["visible"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "hauskarte/remove_orphans", vol.Required("entity_ids"): [str]}
)
@callback
def ws_remove_orphans(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.remove_orphans(msg["entity_ids"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/device_disabled",
        vol.Required("device_id"): str,
        vol.Required("disabled"): bool,
    }
)
@callback
def ws_device_disabled(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.set_device_disabled(msg["device_id"], msg["disabled"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/merge",
        vol.Required("key"): str,
        vol.Required("primary"): str,
        vol.Optional("area_id"): vol.Any(str, None),
    }
)
@callback
def ws_merge(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.merge(msg["key"], msg["primary"], msg.get("area_id")))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "hauskarte/unmerge", vol.Required("key"): str})
@callback
def ws_unmerge(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.unmerge(msg["key"]))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "hauskarte/not_duplicate", vol.Required("key"): str})
@callback
def ws_not_duplicate(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.not_duplicate(msg["key"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/floor_update",
        vol.Required("floor_id"): str,
        vol.Optional("name"): str,
        vol.Optional("level"): vol.Any(int, None),
    }
)
@callback
def ws_floor_update(hass, connection, msg) -> None:
    _run(
        hass,
        connection,
        msg,
        lambda m: m.update_floor(msg["floor_id"], msg.get("name"), msg.get("level"), "level" in msg),
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/area_update",
        vol.Required("area_id"): str,
        vol.Optional("name"): str,
        vol.Optional("floor_id"): vol.Any(str, None),
    }
)
@callback
def ws_area_update(hass, connection, msg) -> None:
    _run(
        hass,
        connection,
        msg,
        lambda m: m.update_area(msg["area_id"], msg.get("name"), msg.get("floor_id"), "floor_id" in msg),
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/area_create",
        vol.Required("name"): str,
        vol.Optional("floor_id"): vol.Any(str, None),
    }
)
@callback
def ws_area_create(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: {"area_id": m.create_area(msg["name"], msg.get("floor_id"))})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/device_area",
        vol.Required("device_id"): str,
        vol.Required("area_id"): vol.Any(str, None),
    }
)
@callback
def ws_device_area(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.set_device_area(msg["device_id"], msg["area_id"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/ai_review",
        vol.Optional("only"): [vol.In(["floors", "duplicates", "orphans", "silent", "switches"])],
    }
)
@callback
def ws_ai_review(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: {"started": m.start_ai_review(msg.get("only"))})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/apply_floor_plan",
        vol.Optional("floors", default=[]): [
            {
                vol.Required("floor_id"): str,
                vol.Optional("name"): str,
                vol.Optional("level"): vol.Any(int, None),
            }
        ],
        vol.Optional("rooms", default=[]): [
            {vol.Required("area_id"): str, vol.Required("floor_id"): vol.Any(str, None)}
        ],
    }
)
@callback
def ws_apply_floor_plan(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.apply_floor_plan(msg["floors"], msg["rooms"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/kind_override",
        vol.Required("entity_id"): str,
        vol.Required("kind"): vol.Any(str, None),
    }
)
@callback
def ws_kind_override(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.set_kind_override(msg["entity_id"], msg["kind"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/wizard",
        vol.Optional("pos"): vol.Any(str, None),
        vol.Optional("done"): str,
        vol.Optional("finished"): bool,
        vol.Optional("dismissed"): bool,
        vol.Optional("reset"): bool,
    }
)
@callback
def ws_wizard(hass, connection, msg) -> None:
    _run(
        hass,
        connection,
        msg,
        lambda m: m.set_wizard({k: v for k, v in msg.items() if k not in ("id", "type")}),
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/device_areas",
        vol.Required("items"): [
            {vol.Required("device_id"): str, vol.Required("area_id"): vol.Any(str, None)}
        ],
    }
)
@callback
def ws_device_areas(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.set_device_areas(msg["items"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/item_icon",
        vol.Required("item_id"): str,
        vol.Optional("mdi"): vol.Any(str, None),
        vol.Optional("image"): vol.Any(str, None),
    }
)
@callback
def ws_item_icon(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.set_icon(msg["item_id"], msg.get("mdi"), msg.get("image")))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "hauskarte/area_references", vol.Required("area_id"): str}
)
@callback
def ws_area_references(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.area_references(msg["area_id"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/merge_areas",
        vol.Required("source_id"): str,
        vol.Required("target_id"): str,
    }
)
@callback
def ws_merge_areas(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.merge_areas(msg["source_id"], msg["target_id"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/group_create",
        vol.Required("name"): str,
        vol.Optional("area_ids", default=[]): [str],
    }
)
@callback
def ws_group_create(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: {"label_id": m.create_group(msg["name"], msg["area_ids"])})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/group_update",
        vol.Required("label_id"): str,
        vol.Optional("name"): str,
        vol.Optional("area_ids"): [str],
    }
)
@callback
def ws_group_update(hass, connection, msg) -> None:
    _run(
        hass, connection, msg, lambda m: m.update_group(msg["label_id"], msg.get("name"), msg.get("area_ids"))
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "hauskarte/group_delete", vol.Required("label_id"): str}
)
@callback
def ws_group_delete(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.delete_group(msg["label_id"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/group_convert_preview",
        vol.Required("area_id"): str,
        vol.Required("member_ids"): [str],
    }
)
@callback
def ws_group_convert_preview(hass, connection, msg) -> None:
    _run(hass, connection, msg, lambda m: m.convert_preview(msg["area_id"], msg["member_ids"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hauskarte/group_convert",
        vol.Required("area_id"): str,
        vol.Required("member_ids"): [str],
        vol.Optional("devices", default={}): {str: str},
        vol.Optional("entities", default={}): {str: str},
    }
)
@callback
def ws_group_convert(hass, connection, msg) -> None:
    _run(
        hass,
        connection,
        msg,
        lambda m: {
            "label_id": m.convert_area_to_group(
                msg["area_id"], msg["member_ids"], msg["devices"], msg["entities"]
            )
        },
    )
