"""End to end: registries → proposals → apply → undo, through the websocket API."""

import json
from unittest.mock import patch

from homeassistant import config_entries
from homeassistant.components.homeassistant.exposed_entities import (
    async_expose_entity,
    async_should_expose,
)
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
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
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hauskarte.const import DOMAIN


async def _house(hass: HomeAssistant):
    source = MockConfigEntry(domain="test")
    source.add_to_hass(hass)
    floor = fr.async_get(hass).async_create("Erdgeschoss", level=0)
    kitchen = ar.async_get(hass).async_create("Küche", floor_id=floor.floor_id)
    ar.async_get(hass).async_create("Bad")

    dev_reg, ent_reg = dr.async_get(hass), er.async_get(hass)
    lamp = dev_reg.async_get_or_create(
        config_entry_id=source.entry_id, identifiers={("test", "lamp")}, name="Küche Deckenlampe"
    )
    plug = dev_reg.async_get_or_create(
        config_entry_id=source.entry_id, identifiers={("test", "plug")}, name="0x00158d0001a2b3c4"
    )
    light = ent_reg.async_get_or_create(
        "light", "test", "lamp", device_id=lamp.id, config_entry=source, suggested_object_id="lamp"
    )
    rssi = ent_reg.async_get_or_create(
        "sensor",
        "test",
        "lamp_rssi",
        device_id=lamp.id,
        config_entry=source,
        entity_category=EntityCategory.DIAGNOSTIC,
        suggested_object_id="lamp_rssi",
    )
    switch = ent_reg.async_get_or_create(
        "switch", "test", "plug", device_id=plug.id, config_entry=source, suggested_object_id="plug"
    )
    assert (light.entity_id, rssi.entity_id, switch.entity_id) == (
        "light.lamp",
        "sensor.lamp_rssi",
        "switch.plug",
    )
    for entity_id in ("light.lamp", "sensor.lamp_rssi", "switch.plug"):
        hass.states.async_set(entity_id, "on")
        async_expose_entity(hass, "conversation", entity_id, True)
    return kitchen, lamp, plug


async def _setup(hass: HomeAssistant) -> MockConfigEntry:
    entry = MockConfigEntry(domain=DOMAIN, options={"llm_mode": "none", "batch_size": 8}, unique_id=DOMAIN)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_scan_apply_undo(ha_base, hass_ws_client):
    hass = ha_base
    kitchen, lamp, plug = await _house(hass)
    await _setup(hass)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id({"type": "hauskarte/scan", "use_llm": False})
    assert (await client.receive_json())["result"] == {"started": True}
    await hass.async_block_till_done()

    await client.send_json_auto_id({"type": "hauskarte/state"})
    state = (await client.receive_json())["result"]
    props = {p["id"]: p for p in state["proposals"]}
    lamp_prop = props[f"device:{lamp.id}"]
    plug_prop = props[f"device:{plug.id}"]
    assert lamp_prop["proposed"]["area_id"] == kitchen.id
    assert lamp_prop["safe"]
    assert set(plug_prop["flags"]) == {"area_missing", "name_technical"}
    assert not plug_prop["safe"]
    assert [a["name"] for a in state["areas"]] == ["Küche", "Bad"]  # floors first

    # bulk: only the safe lamp
    await client.send_json_auto_id({"type": "hauskarte/apply_safe"})
    assert (await client.receive_json())["result"] == {"proposals": 1, "changes": 2}
    assert dr.async_get(hass).async_get(lamp.id).area_id == kitchen.id
    assert not async_should_expose(hass, "conversation", "sensor.lamp_rssi")

    # by hand: name, area and aliases for the plug
    await client.send_json_auto_id(
        {
            "type": "hauskarte/apply",
            "proposal_id": f"device:{plug.id}",
            "values": {
                "area_id": kitchen.id,
                "name": "Kaffeemaschine",
                "entities": {"switch.plug": {"exposed": True, "aliases": ["Kaffee", "Espresso"]}},
            },
        }
    )
    assert (await client.receive_json())["result"]["changes"] == 3
    dev = dr.async_get(hass).async_get(plug.id)
    assert (dev.name_by_user, dev.area_id) == ("Kaffeemaschine", kitchen.id)
    ent = er.async_get(hass).async_get("switch.plug")
    assert [a for a in ent.aliases if isinstance(a, str)] == ["Kaffee", "Espresso"]

    # a new scan does not bring decided units back
    await client.send_json_auto_id({"type": "hauskarte/scan", "use_llm": False})
    await client.receive_json()
    await hass.async_block_till_done()
    await client.send_json_auto_id({"type": "hauskarte/state"})
    state = (await client.receive_json())["result"]
    assert state["proposals"] == []
    assert len(state["history"]) == 2

    # undo the plug, then the lamp
    await client.send_json_auto_id({"type": "hauskarte/undo"})
    assert (await client.receive_json())["result"]["reverted"] == 3
    dev = dr.async_get(hass).async_get(plug.id)
    assert (dev.name_by_user, dev.area_id) == (None, None)
    ent = er.async_get(hass).async_get("switch.plug")
    assert [a for a in ent.aliases if isinstance(a, str)] == []

    await client.send_json_auto_id({"type": "hauskarte/undo"})
    assert (await client.receive_json())["result"]["reverted"] == 2
    assert dr.async_get(hass).async_get(lamp.id).area_id is None
    assert async_should_expose(hass, "conversation", "sensor.lamp_rssi")


async def test_ignore_and_later(ha_base, hass_ws_client):
    hass = ha_base
    _, _, plug = await _house(hass)
    await _setup(hass)
    client = await hass_ws_client(hass)
    pid = f"device:{plug.id}"
    manager = hass.data[DOMAIN]
    await manager.async_scan(False)

    await client.send_json_auto_id({"type": "hauskarte/decide", "proposal_id": pid, "status": "later"})
    assert (await client.receive_json())["success"]
    await manager.async_scan(False)
    assert manager.data["proposals"][pid]["status"] == "later"

    await client.send_json_auto_id({"type": "hauskarte/decide", "proposal_id": pid, "status": "ignored"})
    assert (await client.receive_json())["success"]
    await manager.async_scan(False)
    assert pid not in manager.data["proposals"]

    await client.send_json_auto_id({"type": "hauskarte/decide", "proposal_id": pid, "status": "open"})
    assert (await client.receive_json())["success"]
    await manager.async_scan(False)
    assert manager.data["proposals"][pid]["status"] == "open"


async def test_llm_fills_gaps(ha_base):
    hass = ha_base
    kitchen, _, plug = await _house(hass)
    entry = MockConfigEntry(
        domain=DOMAIN,
        options={"llm_mode": "openai", "api_url": "http://llm.invalid/v1", "model": "m", "batch_size": 8},
        unique_id=DOMAIN,
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    manager = hass.data[DOMAIN]
    answer = json.dumps(
        {
            "devices": [
                {
                    "id": f"device:{plug.id}",
                    "area_id": kitchen.id,
                    "name": "Kaffeemaschine",
                    "aliases": ["Kaffee"],
                    "relevant": True,
                    "confidence": 0.9,
                }
            ]
        }
    )
    with patch("custom_components.hauskarte.llm._ask_openai", return_value=answer) as ask:
        await manager.async_scan(True)
    assert ask.call_count == 1
    prop = manager.data["proposals"][f"device:{plug.id}"]
    assert prop["source"] == "llm"
    assert prop["proposed"] == {"area_id": kitchen.id, "name": "Kaffeemaschine"}
    assert not prop["safe"]


async def test_llm_error_is_reported(ha_base):
    hass = ha_base
    await _house(hass)
    entry = MockConfigEntry(
        domain=DOMAIN,
        options={"llm_mode": "openai", "api_url": "http://llm.invalid/v1", "model": "m", "batch_size": 8},
        unique_id=DOMAIN,
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    manager = hass.data[DOMAIN]
    await manager.async_scan(True)
    assert manager.progress["error"]
    assert not manager.progress["running"]
    assert manager.data["proposals"]  # rule proposals survive


async def test_config_flow(ha_base):
    hass = ha_base
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"llm_mode": "openai", "batch_size": 8}
    )
    assert result["errors"] == {"api_url": "required", "model": "required"}
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {"llm_mode": "openai", "api_url": "http://llm.invalid/v1", "model": "m", "batch_size": 8},
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["options"]["model"] == "m"


async def test_orphans_devices_and_no_deprecations(ha_base, hass_ws_client, caplog):
    hass = ha_base
    _kitchen, lamp, _plug = await _house(hass)
    await _setup(hass)
    client = await hass_ws_client(hass)

    async def ws(**msg):
        await client.send_json_auto_id(msg)
        reply = await client.receive_json()
        assert reply["success"], reply
        return reply["result"]

    # an entity nobody provides any more, and one that is alive
    hass.states.async_set("switch.plug", "unavailable", {"restored": True})
    state = await ws(type="hauskarte/state")
    orphan_ids = [e["entity_id"] for g in state["orphans"] for e in g["entities"]]
    assert orphan_ids == ["switch.plug"]
    assert not any(r["proposed"]["remove"] for p in state["proposals"] for r in p["entities"])

    # only still-restored entities are removed
    assert (await ws(type="hauskarte/remove_orphans", entity_ids=["switch.plug", "light.lamp"]))[
        "removed"
    ] == 1
    assert er.async_get(hass).async_get("switch.plug") is None
    assert er.async_get(hass).async_get("light.lamp") is not None

    # devices overview: the plug device now has no entities left, the lamp is alive
    groups = (await ws(type="hauskarte/state"))["devices"]
    devices = {d["device_id"]: d for g in groups for d in g["devices"]}
    assert devices[lamp.id]["silent"] is False and devices[lamp.id]["deletable"] is False

    # disable and undo
    await ws(type="hauskarte/device_disabled", device_id=lamp.id, disabled=True)
    assert dr.async_get(hass).async_get(lamp.id).disabled_by is dr.DeviceEntryDisabler.USER
    devices = {d["device_id"]: d for g in (await ws(type="hauskarte/state"))["devices"] for d in g["devices"]}
    assert devices[lamp.id]["disabled"] is True
    await ws(type="hauskarte/undo")
    assert dr.async_get(hass).async_get(lamp.id).disabled_by is None

    # not relevant: off the lists, not for the assistant, hidden on the map – and back with undo
    assert async_should_expose(hass, "conversation", "light.lamp")
    await ws(type="hauskarte/device_irrelevant", device_id=lamp.id, irrelevant=True)
    state = await ws(type="hauskarte/state")
    devices = {d["device_id"]: d for g in state["devices"] for d in g["devices"]}
    assert devices[lamp.id]["irrelevant"] is True
    assert not async_should_expose(hass, "conversation", "light.lamp")
    assert f"device:{lamp.id}" not in {p["id"] for p in state["proposals"]}
    await ws(type="hauskarte/scan", use_llm=False)
    assert f"device:{lamp.id}" not in {p["id"] for p in (await ws(type="hauskarte/state"))["proposals"]}
    await ws(type="hauskarte/undo")
    devices = {d["device_id"]: d for g in (await ws(type="hauskarte/state"))["devices"] for d in g["devices"]}
    assert devices[lamp.id]["irrelevant"] is False
    assert async_should_expose(hass, "conversation", "light.lamp")

    # own name in place, back to the integration's name when emptied or set to it, undoable
    original = dr.async_get(hass).async_get(lamp.id).name
    await ws(type="hauskarte/device_name", device_id=lamp.id, name="  Licht Flur ")
    assert dr.async_get(hass).async_get(lamp.id).name_by_user == "Licht Flur"
    devices = {d["device_id"]: d for g in (await ws(type="hauskarte/state"))["devices"] for d in g["devices"]}
    assert devices[lamp.id]["name"] == "Licht Flur" and devices[lamp.id]["original_name"] == original
    await ws(type="hauskarte/device_name", device_id=lamp.id, name=original)
    assert dr.async_get(hass).async_get(lamp.id).name_by_user is None
    await ws(type="hauskarte/undo")
    assert dr.async_get(hass).async_get(lamp.id).name_by_user == "Licht Flur"

    # what the assistant sees: listed with the room, switched in one undo step
    items = {x["entity_id"]: x for x in (await ws(type="hauskarte/exposure"))["entities"]}
    assert items["light.lamp"]["exposed"] is True and items["light.lamp"]["kind"] == "light"
    assert "switch.plug" not in items  # removed above
    result = await ws(type="hauskarte/set_exposed", entity_ids=["light.lamp", "light.unknown"], exposed=False)
    assert result["changes"] == 1 and not async_should_expose(hass, "conversation", "light.lamp")
    assert (await ws(type="hauskarte/set_exposed", entity_ids=["light.lamp"], exposed=False))["changes"] == 0
    await ws(type="hauskarte/undo")
    assert async_should_expose(hass, "conversation", "light.lamp")

    # HA warns about deprecated registry access in the log; there must be none from us
    assert "hauskarte" not in "".join(
        r.getMessage() for r in caplog.records if "deprecated" in r.getMessage()
    )


async def test_merge_duplicates_without_touching_integrations(ha_base, hass_ws_client):
    hass = ha_base
    kitchen, lamp, _plug = await _house(hass)
    ent_reg = er.async_get(hass)
    knx = MockConfigEntry(domain="knx_test")
    knx.add_to_hass(hass)
    twin = ent_reg.async_get_or_create("light", "knx_test", "decke", suggested_object_id="decke_knx")
    ent_reg.async_update_entity(twin.entity_id, area_id=kitchen.id, name="Küche Deckenlampe")
    ent_reg.async_update_entity("light.lamp", name="Küche Deckenlampe")
    # real states carry the registry name as friendly_name
    hass.states.async_set(twin.entity_id, "on", {"friendly_name": "Küche Deckenlampe"})
    hass.states.async_set("light.lamp", "on", {"friendly_name": "Küche Deckenlampe"})
    async_expose_entity(hass, "conversation", twin.entity_id, True)
    dr.async_get(hass).async_update_device(lamp.id, area_id=kitchen.id)
    await _setup(hass)
    manager = hass.data[DOMAIN]
    await manager.async_scan(False)
    client = await hass_ws_client(hass)

    async def ws(**msg):
        await client.send_json_auto_id(msg)
        reply = await client.receive_json()
        assert reply["success"], reply
        return reply["result"]

    state = await ws(type="hauskarte/state")
    group = next(g for g in state["duplicates"] if twin.entity_id in g["key"])
    assert {m["entity_id"] for m in group["members"]} == {"light.lamp", twin.entity_id}

    await ws(type="hauskarte/merge", key=group["key"], primary="light.lamp")
    assert async_should_expose(hass, "conversation", "light.lamp")
    assert not async_should_expose(hass, "conversation", twin.entity_id)
    assert ent_reg.async_get(twin.entity_id).hidden_by is er.RegistryEntryHider.USER
    assert ent_reg.async_get(twin.entity_id).disabled_by is None  # still works for automations
    state = await ws(type="hauskarte/state")
    assert state["duplicates"] == [] and state["merged"][0]["primary"] == "light.lamp"

    await ws(type="hauskarte/unmerge", key=group["key"])
    assert async_should_expose(hass, "conversation", twin.entity_id)
    assert ent_reg.async_get(twin.entity_id).hidden_by is None
    assert (await ws(type="hauskarte/state"))["merged"] == []

    await ws(type="hauskarte/not_duplicate", key=group["key"])
    assert (await ws(type="hauskarte/state"))["duplicates"] == []
    await ws(type="hauskarte/undo")
    assert len((await ws(type="hauskarte/state"))["duplicates"]) == 1


async def test_floors_and_rooms(ha_base, hass_ws_client):
    hass = ha_base
    await _setup(hass)
    client = await hass_ws_client(hass)

    async def ws(**msg):
        await client.send_json_auto_id(msg)
        reply = await client.receive_json()
        assert reply["success"], reply
        return reply["result"]

    floor = fr.async_get(hass).async_create("Upper Floor", level=2)
    room_id = (await ws(type="hauskarte/area_create", name="Gästezimmer"))["area_id"]
    await ws(type="hauskarte/floor_update", floor_id=floor.floor_id, name="Obere Wohnung", level=1)
    await ws(type="hauskarte/area_update", area_id=room_id, floor_id=floor.floor_id, name="Gästezimmer oben")
    floor_now = fr.async_get(hass).async_get_floor(floor.floor_id)
    assert (floor_now.name, floor_now.level) == ("Obere Wohnung", 1)
    area = ar.async_get(hass).async_get_area(room_id)
    assert (area.name, area.floor_id) == ("Gästezimmer oben", floor.floor_id)

    state = await ws(type="hauskarte/state")
    room = next(r for r in state["map"]["rooms"] if r["area_id"] == room_id)
    assert room["floor_id"] == floor.floor_id

    await ws(type="hauskarte/undo")  # room name and floor
    area = ar.async_get(hass).async_get_area(room_id)
    assert (area.name, area.floor_id) == ("Gästezimmer", None)
    await ws(type="hauskarte/undo")  # floor name and level
    assert fr.async_get(hass).async_get_floor(floor.floor_id).name == "Upper Floor"


async def test_kinds_reach_the_panel(ha_base, hass_ws_client):
    hass = ha_base
    kitchen, lamp, plug = await _house(hass)
    dr.async_get(hass).async_update_device(lamp.id, area_id=kitchen.id)
    await _setup(hass)
    await hass.data[DOMAIN].async_scan(False)
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "hauskarte/state"})
    state = (await client.receive_json())["result"]
    room = next(r for r in state["map"]["rooms"] if r["area_id"] == kitchen.id)
    assert room["devices"][0]["what"] == "light" and room["counts"] == {"light": 1}
    plug_card = next(p for p in state["proposals"] if p["id"] == f"device:{plug.id}")
    assert plug_card["what"] == "socket"  # "plug" in the name
    devices = {d["device_id"]: d for g in state["devices"] for d in g["devices"]}
    assert devices[lamp.id]["kind"] == "light" and devices[lamp.id]["area_id"] == kitchen.id


async def test_ai_review(ha_base, hass_ws_client):
    hass = ha_base
    _kitchen, _lamp, plug = await _house(hass)
    hass.config.language = "de"
    floor = fr.async_get(hass).async_create("Upper Floor", level=2)
    bath = ar.async_get(hass).async_get_area_by_name("Bad")  # has no floor yet
    hass.states.async_set("switch.plug", "on", {"friendly_name": "Relais 1"})  # kind unclear → asked
    entry = MockConfigEntry(
        domain=DOMAIN,
        options={"llm_mode": "openai", "api_url": "http://llm.invalid/v1", "model": "m", "batch_size": 8},
        unique_id=DOMAIN,
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    manager = hass.data[DOMAIN]
    await manager.async_scan(False)
    asked = []

    async def fake_ask(hass_, options, system, user):
        asked.append(user.split("\n", 1)[0])
        if user.startswith("Task: floors"):
            return {
                "floors": [
                    {
                        "floor_id": floor.floor_id,
                        "name": "Obere Wohnung",
                        "level": 1,
                        "reason": "x",
                        "confidence": 0.9,
                    }
                ],
                "rooms": [{"area_id": bath.id, "floor_id": floor.floor_id, "reason": "y", "confidence": 0.7}],
            }
        if user.startswith("Task: what does each switch drive"):
            return {
                "switches": [
                    {"entity_id": "switch.plug", "kind": "water", "reason": "Pumpe", "confidence": 0.6}
                ]
            }
        return {}

    with patch("custom_components.hauskarte.llm.ask_json", side_effect=fake_ask):
        await manager.async_ai_review()
    assert asked[0] == "Task: floors." and any(a.startswith("Task: what does") for a in asked)
    client = await hass_ws_client(hass)

    async def ws(**msg):
        await client.send_json_auto_id(msg)
        reply = await client.receive_json()
        assert reply["success"], reply
        return reply["result"]

    state = await ws(type="hauskarte/state")
    assert state["ai"]["floors"][0]["name"] == "Obere Wohnung"
    assert state["ai"]["rooms"][0]["area_id"] == bath.id
    plug_row = next(d for g in state["devices"] for d in g["devices"] if d["device_id"] == plug.id)
    assert plug_row["ai_kind"]["kind"] == "water"

    await ws(
        type="hauskarte/apply_floor_plan",
        floors=[{"floor_id": floor.floor_id, "name": "Obere Wohnung", "level": 1}],
        rooms=[{"area_id": bath.id, "floor_id": floor.floor_id}],
    )
    assert fr.async_get(hass).async_get_floor(floor.floor_id).name == "Obere Wohnung"
    assert ar.async_get(hass).async_get_area(bath.id).floor_id == floor.floor_id
    state = await ws(type="hauskarte/state")
    assert state["ai"]["floors"] == [] and state["ai"]["rooms"] == []  # done, so no longer proposed

    await ws(type="hauskarte/kind_override", entity_id="switch.plug", kind="water")
    plug_row = next(
        d
        for g in (await ws(type="hauskarte/state"))["devices"]
        for d in g["devices"]
        if d["device_id"] == plug.id
    )
    assert plug_row["kind"] == "water" and plug_row["ai_kind"] is None

    await ws(type="hauskarte/undo")  # kind
    plug_row = next(
        d
        for g in (await ws(type="hauskarte/state"))["devices"]
        for d in g["devices"]
        if d["device_id"] == plug.id
    )
    assert plug_row["kind"] == "switch"  # really back
    await ws(type="hauskarte/undo")  # floor plan
    assert fr.async_get(hass).async_get_floor(floor.floor_id).name == "Upper Floor"
    assert ar.async_get(hass).async_get_area(bath.id).floor_id is None


async def test_room_names_are_unique(ha_base, hass_ws_client):
    hass = ha_base
    await _setup(hass)
    client = await hass_ws_client(hass)
    first = ar.async_get(hass).async_create("Bad")
    second = ar.async_get(hass).async_create("Bad oben")

    await client.send_json_auto_id({"type": "hauskarte/area_update", "area_id": second.id, "name": "Bad"})
    reply = await client.receive_json()
    assert not reply["success"] and "already in use" in reply["error"]["message"]
    assert ar.async_get(hass).async_get_area(second.id).name == "Bad oben"

    await client.send_json_auto_id({"type": "hauskarte/area_create", "name": "bad"})
    reply = await client.receive_json()
    assert not reply["success"] and "already in use" in reply["error"]["message"]
    assert ar.async_get(hass).async_get_area(first.id).name == "Bad"
