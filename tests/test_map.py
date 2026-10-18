"""Map, floor plan, description sensor and repairs entry inside Home Assistant."""

import json
from unittest.mock import patch

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import floor_registry as fr
from homeassistant.helpers import issue_registry as ir
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.hauskarte.const import DOMAIN

IMAGE = "data:image/jpeg;base64,AAAA"


async def _setup(hass: HomeAssistant, **options) -> MockConfigEntry:
    entry = MockConfigEntry(
        domain=DOMAIN, options={"llm_mode": "none", "batch_size": 8, **options}, unique_id=DOMAIN
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_draw_rooms_and_undo(ha_base, hass_ws_client):
    hass = ha_base
    hass.config.language = "de"
    await _setup(hass)
    client = await hass_ws_client(hass)

    async def ws(**msg):
        await client.send_json_auto_id(msg)
        reply = await client.receive_json()
        assert reply["success"], reply
        return reply["result"]

    floor_id = (await ws(type="hauskarte/create_floor", name="Erdgeschoss", level=0))["floor_id"]
    kitchen = ar.async_get(hass).async_create("Küche")  # exists, but on no floor yet

    # draw the kitchen and a new room "Flur" next to it
    await ws(
        type="hauskarte/place_rooms",
        floor_id=floor_id,
        rooms=[{"area_id": kitchen.id, "x": 0, "y": 0, "w": 4, "h": 3}],
    )
    await ws(
        type="hauskarte/place_rooms",
        floor_id=floor_id,
        rooms=[{"name": "Flur", "x": 4, "y": 0, "w": 3, "h": 3}],
    )
    flur = ar.async_get(hass).async_get_area_by_name("Flur")
    assert flur is not None and flur.floor_id == floor_id
    assert ar.async_get(hass).async_get_area(kitchen.id).floor_id == floor_id

    state = await ws(type="hauskarte/state")
    assert "- Erdgeschoss: Flur, Küche" in state["description"]
    assert "- Flur grenzt an Küche." in state["description"]
    assert state["sensor"] == "sensor.hauskarte_beschreibung"

    # the sensor follows
    await hass.async_block_till_done()
    sensor = hass.states.get("sensor.hauskarte_beschreibung")
    assert "Flur grenzt an Küche" in sensor.attributes["text"]

    # move, note, then undo the new room: area and position are gone again
    await ws(type="hauskarte/position", area_id=kitchen.id, position={"x": 30, "y": 0, "w": 9, "h": 3})
    state = await ws(type="hauskarte/state")
    pos = next(r for r in state["map"]["rooms"] if r["area_id"] == kitchen.id)["position"]
    assert pos == {"x": 23, "y": 0, "w": 1, "h": 3}  # clamped to the 24 column grid
    await ws(type="hauskarte/note", key=kitchen.id, text="mit Speisekammer")
    assert "- Küche: mit Speisekammer" in (await ws(type="hauskarte/state"))["description"]

    await ws(type="hauskarte/undo")
    assert ar.async_get(hass).async_get_area_by_name("Flur") is None
    await ws(type="hauskarte/undo")
    assert ar.async_get(hass).async_get_area(kitchen.id).floor_id is None
    state = await ws(type="hauskarte/state")
    assert all(r["position"] is None for r in state["map"]["rooms"])

    await ws(type="hauskarte/undo")  # the floor
    assert fr.async_get(hass).async_get_floor(floor_id) is None


async def test_floor_plan_detection(ha_base, hass_ws_client):
    hass = ha_base
    await _setup(hass, llm_mode="openai", api_url="http://llm.invalid/v1", model="m")
    client = await hass_ws_client(hass)
    floor = fr.async_get(hass).async_create("Obergeschoss", level=1)
    bad = ar.async_get(hass).async_create("Bad")

    async def ws(**msg):
        await client.send_json_auto_id(msg)
        reply = await client.receive_json()
        assert reply["success"], reply
        return reply["result"]

    await ws(type="hauskarte/floor_plan", floor_id=floor.floor_id, image=IMAGE, rows=12)
    assert (await ws(type="hauskarte/floor_image", floor_id=floor.floor_id))["image"] == IMAGE

    answer = json.dumps(
        {
            "rooms": [
                {"name": "Bad", "area_id": bad.id, "x": 0, "y": 0, "w": 3, "h": 3},
                {"name": "Schlafzimmer", "area_id": None, "x": 3, "y": 0, "w": 5, "h": 4},
            ]
        }
    )

    with patch(
        "custom_components.hauskarte.llm.async_get_clientsession",
    ) as session:
        response = session.return_value.post.return_value.__aenter__.return_value
        response.status = 200

        async def fake_json(content_type=None):
            return {"choices": [{"message": {"content": answer}}]}

        response.json = fake_json
        result = await ws(type="hauskarte/detect_plan", floor_id=floor.floor_id, image=IMAGE)
        body = session.return_value.post.call_args.kwargs["json"]
    assert body["messages"][0]["content"][1]["image_url"]["url"] == IMAGE
    assert "12 rows" in body["messages"][0]["content"][0]["text"]
    assert [r["name"] for r in result["rooms"]] == ["Bad", "Schlafzimmer"]

    state = await ws(type="hauskarte/state")
    og = next(f for f in state["map"]["floors"] if f["floor_id"] == floor.floor_id)
    assert len(og["detected"]) == 2 and og["image"]

    await ws(
        type="hauskarte/place_rooms",
        floor_id=floor.floor_id,
        detected=True,
        rooms=[{**r, "area_id": r["area_id"]} for r in result["rooms"]],
    )
    assert ar.async_get(hass).async_get_area(bad.id).floor_id == floor.floor_id
    assert ar.async_get(hass).async_get_area_by_name("Schlafzimmer").floor_id == floor.floor_id
    state = await ws(type="hauskarte/state")
    og = next(f for f in state["map"]["floors"] if f["floor_id"] == floor.floor_id)
    assert og["detected"] == []


async def test_detection_needs_openai_mode(ha_base, hass_ws_client):
    hass = ha_base
    await _setup(hass)
    client = await hass_ws_client(hass)
    floor = fr.async_get(hass).async_create("EG", level=0)
    await client.send_json_auto_id(
        {"type": "hauskarte/detect_plan", "floor_id": floor.floor_id, "image": IMAGE}
    )
    reply = await client.receive_json()
    assert not reply["success"]
    assert "OpenAI" in reply["error"]["message"]


async def test_repairs_entry_for_new_proposals(ha_base, hass_ws_client):
    hass = ha_base
    await _setup(hass)
    manager = hass.data[DOMAIN]
    source = MockConfigEntry(domain="test")
    source.add_to_hass(hass)
    dev = dr.async_get(hass).async_get_or_create(
        config_entry_id=source.entry_id, identifiers={("test", "sat")}, name="Voice PE"
    )
    er.async_get(hass).async_get_or_create(
        "assist_satellite", "test", "sat", device_id=dev.id, config_entry=source, suggested_object_id="voice"
    )
    hass.states.async_set("assist_satellite.voice", "idle")

    await manager.async_scan(False)
    prop = manager.data["proposals"][f"device:{dev.id}"]
    assert "speaker" in prop["flags"] and "area_missing" in prop["flags"]
    issue = ir.async_get(hass).async_get_issue(DOMAIN, "new_proposals")
    assert issue is not None and issue.translation_placeholders["count"] == "1"

    # opening the panel counts as seen
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "hauskarte/state"})
    state = (await client.receive_json())["result"]
    assert state["proposals"][0]["id"] == f"device:{dev.id}"  # speakers first
    assert ir.async_get(hass).async_get_issue(DOMAIN, "new_proposals") is None

    # a second scan finds nothing new: no entry
    await manager.async_scan(False)
    assert ir.async_get(hass).async_get_issue(DOMAIN, "new_proposals") is None


async def test_new_device_triggers_rules_scan(ha_base):
    hass = ha_base
    await _setup(hass)
    manager = hass.data[DOMAIN]
    source = MockConfigEntry(domain="test")
    source.add_to_hass(hass)
    with patch.object(manager, "schedule_rules_scan") as schedule:
        dr.async_get(hass).async_get_or_create(
            config_entry_id=source.entry_id, identifiers={("test", "new")}, name="Neu"
        )
        await hass.async_block_till_done()
    schedule.assert_called_once()


async def test_devices_on_the_map(ha_base, hass_ws_client):
    hass = ha_base
    await _setup(hass)
    manager = hass.data[DOMAIN]
    client = await hass_ws_client(hass)

    async def ws(**msg):
        await client.send_json_auto_id(msg)
        reply = await client.receive_json()
        assert reply["success"], reply
        return reply["result"]

    floor = fr.async_get(hass).async_create("Erdgeschoss", level=0)
    kitchen = ar.async_get(hass).async_create("Küche", floor_id=floor.floor_id)
    living = ar.async_get(hass).async_create("Wohnzimmer", floor_id=floor.floor_id)
    source = MockConfigEntry(domain="test")
    source.add_to_hass(hass)
    lamp = dr.async_get(hass).async_get_or_create(
        config_entry_id=source.entry_id, identifiers={("test", "lamp")}, name="0x00158d0001a2b3c4"
    )
    er.async_get(hass).async_get_or_create(
        "light", "test", "lamp", device_id=lamp.id, config_entry=source, suggested_object_id="lamp"
    )
    hass.states.async_set("light.lamp", "on")
    await manager.async_scan(False)
    pid = f"device:{lamp.id}"

    # without area the lamp waits in the tray; the cleanup card offers "show on map"
    state = await ws(type="hauskarte/state")
    assert [d["id"] for d in state["map"]["unassigned"]] == [lamp.id]
    card = next(p for p in state["proposals"] if p["id"] == pid)
    assert card["on_map"] is True

    # dragging it into the kitchen assigns the area and refreshes the open proposal
    result = await ws(
        type="hauskarte/place_item", item_id=lamp.id, kind="device", area_id=kitchen.id, x=0.3, y=0.6
    )
    assert result["moved_room"]
    assert dr.async_get(hass).async_get(lamp.id).area_id == kitchen.id
    assert "area_missing" not in manager.data["proposals"][pid]["flags"]
    state = await ws(type="hauskarte/state")
    room = next(r for r in state["map"]["rooms"] if r["area_id"] == kitchen.id)
    assert room["devices"][0]["pos"] == {"x": 0.3, "y": 0.6}
    assert state["map"]["unassigned"] == []

    # moving inside the room is no undo step; into another room is
    assert not (
        await ws(
            type="hauskarte/place_item", item_id=lamp.id, kind="device", area_id=kitchen.id, x=0.5, y=0.5
        )
    )["moved_room"]
    await ws(type="hauskarte/place_item", item_id=lamp.id, kind="device", area_id=living.id, x=0.1, y=0.1)
    assert dr.async_get(hass).async_get(lamp.id).area_id == living.id
    await ws(type="hauskarte/undo")
    assert dr.async_get(hass).async_get(lamp.id).area_id == kitchen.id
    assert manager.data["pins"][lamp.id] == {"x": 0.5, "y": 0.5}

    # hide from the map, undo brings it back
    await ws(type="hauskarte/item_visible", item_id=lamp.id, visible=False)
    state = await ws(type="hauskarte/state")
    assert not next(r for r in state["map"]["rooms"] if r["area_id"] == kitchen.id)["devices"][0]["visible"]
    await ws(type="hauskarte/undo")
    assert lamp.id not in manager.data["shown"]

    # accepting a card with the box unticked hides it
    await ws(type="hauskarte/apply", proposal_id=pid, values={"name": "Deckenlampe", "on_map": False})
    assert manager.data["shown"][lamp.id] is False


async def test_wizard_progress_and_bulk_rooms(ha_base, hass_ws_client):
    hass = ha_base
    await _setup(hass)
    client = await hass_ws_client(hass)

    async def ws(**msg):
        await client.send_json_auto_id(msg)
        reply = await client.receive_json()
        assert reply["success"], reply
        return reply["result"]

    state = await ws(type="hauskarte/state")
    assert state["wizard"] == {"pos": None, "done": [], "finished": False, "dismissed": False}
    await ws(type="hauskarte/wizard", pos="floors", done="welcome")
    await ws(type="hauskarte/wizard", pos="floors", done="welcome")  # no double entries
    assert (await ws(type="hauskarte/state"))["wizard"]["done"] == ["welcome"]
    await ws(type="hauskarte/wizard", dismissed=True)
    assert hass.data[DOMAIN].data["wizard"]["pos"] == "floors"  # remembered for later

    source = MockConfigEntry(domain="test")
    source.add_to_hass(hass)
    kitchen = ar.async_get(hass).async_create("Küche")
    devs = [
        dr.async_get(hass).async_get_or_create(
            config_entry_id=source.entry_id, identifiers={("test", str(i))}, name=f"D{i}"
        )
        for i in range(3)
    ]
    result = await ws(
        type="hauskarte/device_areas",
        items=[{"device_id": d.id, "area_id": kitchen.id} for d in devs]
        + [{"device_id": "gone", "area_id": kitchen.id}],
    )
    assert result["changes"] == 3
    assert all(dr.async_get(hass).async_get(d.id).area_id == kitchen.id for d in devs)
    await ws(type="hauskarte/undo")  # one step for all three
    assert all(dr.async_get(hass).async_get(d.id).area_id is None for d in devs)

    await ws(type="hauskarte/wizard", reset=True)
    assert (await ws(type="hauskarte/state"))["wizard"]["done"] == []


async def test_own_icons(ha_base, hass_ws_client):
    hass = ha_base
    await _setup(hass)
    client = await hass_ws_client(hass)

    async def ws(ok=True, **msg):
        await client.send_json_auto_id(msg)
        reply = await client.receive_json()
        assert reply["success"] is ok, reply
        return reply.get("result")

    await ws(type="hauskarte/item_icon", item_id="dev1", mdi="mdi:ceiling-light")
    assert hass.data[DOMAIN].data["icons"]["dev1"] == {"mdi": "mdi:ceiling-light"}
    await ws(type="hauskarte/item_icon", item_id="dev1", image="data:image/png;base64,AAAA")
    assert hass.data[DOMAIN].data["icons"]["dev1"] == {"image": "data:image/png;base64,AAAA"}
    await ws(ok=False, type="hauskarte/item_icon", item_id="dev1", mdi="ceiling-light")  # no mdi: prefix
    await ws(
        ok=False, type="hauskarte/item_icon", item_id="dev1", image="data:image/png;base64," + "A" * 300_000
    )
    await ws(type="hauskarte/undo")  # back to the mdi icon
    assert hass.data[DOMAIN].data["icons"]["dev1"] == {"mdi": "mdi:ceiling-light"}
    await ws(type="hauskarte/item_icon", item_id="dev1")  # default again
    assert "dev1" not in hass.data[DOMAIN].data["icons"]


async def test_merge_rooms(ha_base, hass_ws_client):
    from homeassistant.setup import async_setup_component

    hass = ha_base
    await _setup(hass)
    client = await hass_ws_client(hass)

    async def ws(**msg):
        await client.send_json_auto_id(msg)
        reply = await client.receive_json()
        assert reply["success"], reply
        return reply["result"]

    area_reg = ar.async_get(hass)
    wohn = area_reg.async_create("Wohnzimmer")
    bereich = area_reg.async_create("Wohnbereich", aliases={"Stube"})
    source = MockConfigEntry(domain="test")
    source.add_to_hass(hass)
    dev = dr.async_get(hass).async_get_or_create(
        config_entry_id=source.entry_id, identifiers={("test", "tv")}, name="TV"
    )
    dr.async_get(hass).async_update_device(dev.id, area_id=bereich.id)
    ent = er.async_get(hass).async_get_or_create(
        "light", "test", "stehlampe", suggested_object_id="stehlampe"
    )
    er.async_get(hass).async_update_entity(ent.entity_id, area_id=bereich.id)
    await ws(type="hauskarte/position", area_id=bereich.id, position={"x": 0, "y": 0, "w": 4, "h": 3})
    assert await async_setup_component(
        hass,
        "automation",
        {
            "automation": [
                {
                    "alias": "Abends Wohnbereich",
                    "triggers": [{"trigger": "event", "event_type": "x"}],
                    "actions": [{"action": "light.turn_on", "target": {"area_id": bereich.id}}],
                }
            ]
        },
    )
    await hass.async_block_till_done()

    refs = await ws(type="hauskarte/area_references", area_id=bereich.id)
    assert [a["name"] for a in refs["automations"]] == ["Abends Wohnbereich"]

    assert await ws(type="hauskarte/merge_areas", source_id=bereich.id, target_id=wohn.id) == {
        "devices": 1,
        "entities": 1,
    }
    assert area_reg.async_get_area(bereich.id) is None
    assert dr.async_get(hass).async_get(dev.id).area_id == wohn.id
    assert er.async_get(hass).async_get(ent.entity_id).area_id == wohn.id
    assert area_reg.async_get_area(wohn.id).aliases == {"Wohnbereich", "Stube"}  # old names still understood
    assert hass.data[DOMAIN].data["layout"][wohn.id] == {"x": 0, "y": 0, "w": 4, "h": 3}

    await ws(type="hauskarte/undo")
    back = area_reg.async_get_area_by_name("Wohnbereich")
    assert back is not None and back.aliases == {"Stube"}
    assert dr.async_get(hass).async_get(dev.id).area_id == back.id
    assert er.async_get(hass).async_get(ent.entity_id).area_id == back.id
    assert area_reg.async_get_area(wohn.id).aliases == set()
    assert hass.data[DOMAIN].data["layout"][back.id] == {"x": 0, "y": 0, "w": 4, "h": 3}


async def test_room_groups(ha_base, hass_ws_client):
    from homeassistant.helpers import label_registry as lr

    hass = ha_base
    hass.config.language = "de"
    await _setup(hass)
    client = await hass_ws_client(hass)

    async def ws(**msg):
        await client.send_json_auto_id(msg)
        reply = await client.receive_json()
        assert reply["success"], reply
        return reply["result"]

    area_reg = ar.async_get(hass)
    wohn = area_reg.async_create("Wohnzimmer")
    ess = area_reg.async_create("Esszimmer")
    bereich = area_reg.async_create("Wohnbereich")
    source = MockConfigEntry(domain="test")
    source.add_to_hass(hass)
    dev_reg, ent_reg = dr.async_get(hass), er.async_get(hass)
    esstisch = dev_reg.async_get_or_create(
        config_entry_id=source.entry_id, identifiers={("test", "e")}, name="Esstischlampe"
    )
    stehlampe = dev_reg.async_get_or_create(
        config_entry_id=source.entry_id, identifiers={("test", "s")}, name="Stehlampe"
    )
    for dev in (esstisch, stehlampe):
        dev_reg.async_update_device(dev.id, area_id=bereich.id)
    gruppe = ent_reg.async_get_or_create("cover", "group", "beschattung", suggested_object_id="beschattung")
    ent_reg.async_update_entity(gruppe.entity_id, area_id=bereich.id)

    # preview: "Esstisch…" belongs to Esszimmer by its name, the floor lamp is left for the user
    preview = await ws(
        type="hauskarte/group_convert_preview", area_id=bereich.id, member_ids=[wohn.id, ess.id]
    )
    suggested = {d["name"]: d["suggested"] for d in preview["devices"]}
    assert suggested == {"Esstischlampe": ess.id, "Stehlampe": None}
    assert [e["entity_id"] for e in preview["entities"]] == ["cover.beschattung"]

    label_id = (
        await ws(
            type="hauskarte/group_convert",
            area_id=bereich.id,
            member_ids=[wohn.id, ess.id],
            devices={esstisch.id: ess.id, stehlampe.id: wohn.id},
            entities={},
        )
    )["label_id"]
    assert area_reg.async_get_area(bereich.id) is None
    assert (
        dev_reg.async_get(esstisch.id).area_id == ess.id
        and dev_reg.async_get(stehlampe.id).area_id == wohn.id
    )
    assert ent_reg.async_get(gruppe.entity_id).area_id == wohn.id  # no choice → first member
    assert lr.async_get(hass).async_get_label(label_id).name == "Wohnbereich"
    assert (
        label_id in area_reg.async_get_area(wohn.id).labels
        and label_id in area_reg.async_get_area(ess.id).labels
    )
    state = await ws(type="hauskarte/state")
    assert state["groups"] == [
        {"label_id": label_id, "name": "Wohnbereich", "area_ids": sorted([wohn.id, ess.id])}
    ]
    assert (
        "- Wohnbereich = Esszimmer und Wohnzimmer (wer „Wohnbereich“ sagt, meint alle diese Räume)"
        in state["description"]
    )

    # membership, rename, undo
    kueche = area_reg.async_create("Küche")
    await ws(
        type="hauskarte/group_update", label_id=label_id, name="Wohnen", area_ids=[wohn.id, ess.id, kueche.id]
    )
    assert label_id in area_reg.async_get_area(kueche.id).labels
    assert lr.async_get(hass).async_get_label(label_id).name == "Wohnen"
    await ws(type="hauskarte/undo")
    assert label_id not in area_reg.async_get_area(kueche.id).labels
    assert lr.async_get(hass).async_get_label(label_id).name == "Wohnbereich"

    # undo the conversion: the area is back with its things, the label is gone
    await ws(type="hauskarte/undo")
    back = area_reg.async_get_area_by_name("Wohnbereich")
    assert back is not None
    assert (
        dev_reg.async_get(esstisch.id).area_id == back.id
        and dev_reg.async_get(stehlampe.id).area_id == back.id
    )
    assert ent_reg.async_get(gruppe.entity_id).area_id == back.id
    assert lr.async_get(hass).async_get_label(label_id) is None
    assert (await ws(type="hauskarte/state"))["groups"] == []

    # a plain group, dissolved and brought back
    gid = (await ws(type="hauskarte/group_create", name="Oben", area_ids=[kueche.id]))["label_id"]
    await ws(type="hauskarte/group_delete", label_id=gid)
    assert lr.async_get(hass).async_get_label(gid) is None and not area_reg.async_get_area(kueche.id).labels
    await ws(type="hauskarte/undo")
    groups = (await ws(type="hauskarte/state"))["groups"]
    assert [(g["name"], g["area_ids"]) for g in groups] == [("Oben", [kueche.id])]
