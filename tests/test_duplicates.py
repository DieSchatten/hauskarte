"""Kinds and duplicate detection, no Home Assistant needed."""

from custom_components.hauskarte import duplicates, kinds


def _ent(entity_id, title, platform, **extra):
    return {
        "entity_id": entity_id,
        "domain": entity_id.split(".")[0],
        "title": title,
        "platform": platform,
        "device_id": None,
        "area_id": "kueche",
        "exposed": True,
        **extra,
    }


def _inv(*ents):
    return {
        "floors": {},
        "areas": {"kueche": {"area_id": "kueche", "name": "Küche", "floor_id": None, "aliases": []}},
        "devices": {},
        "entities": {e["entity_id"]: e for e in ents},
    }


def test_kinds():
    k = kinds.entity_kind
    assert k({"domain": "light"}) == "light"
    assert k({"domain": "switch", "title": "Licht Flur"}) == "light"
    assert k({"domain": "switch", "title": "Rollladen Bad"}) == "shading"
    assert k({"domain": "switch", "title": "Relay 1"}, "Kaffeemaschine Steckdose") == "socket"
    assert k({"domain": "switch", "device_class": "outlet", "title": "x"}) == "socket"
    assert k({"domain": "switch", "title": "Bewässerung oben"}) == "water"
    assert k({"domain": "cover", "device_class": "garage"}) == "door"
    assert k({"domain": "cover"}) == "shading"
    assert k({"domain": "binary_sensor", "device_class": "window"}) == "contact"
    assert k({"domain": "sensor", "device_class": "temperature"}) == "temperature"
    assert k({"domain": "assist_satellite"}) == "voice"

    inv = {
        "entities": {
            "sensor.t": {"domain": "sensor", "device_class": "temperature"},
            "light.l": {"domain": "light"},
            "sensor.rssi": {"domain": "sensor", "entity_category": "diagnostic"},
        }
    }
    assert kinds.device_kind(inv, {"entity_ids": ["sensor.t", "light.l", "sensor.rssi"]}) == "light"


def test_name_pairs_same_room_different_integration():
    inv = _inv(
        _ent("light.deckenlicht_kueche", "Deckenlicht Küche", "loxone"),
        _ent("switch.knx_deckenlicht", "Deckenlicht", "knx"),
        _ent("light.deckenlicht_2", "Deckenlicht", "loxone"),  # same integration: not a twin
        _ent("light.ambiente", "Ambiente", "shelly"),
    )
    cand = duplicates.candidates(inv)
    pairs = duplicates.name_pairs(inv, cand)
    found = {(p["a"], p["b"]) for p in pairs}
    assert ("light.deckenlicht_kueche", "switch.knx_deckenlicht") in found
    assert ("light.deckenlicht_2", "switch.knx_deckenlicht") in found
    assert all(a < b for a, b in found)
    assert not any("ambiente" in a or "ambiente" in b for a, b in found)
    assert not any(a.startswith("light.deckenlicht") and b.startswith("light.deckenlicht") for a, b in found)


def test_history_pairs_find_twins_with_unrelated_names():
    inv = _inv(
        _ent("light.deckenlicht", "Deckenlicht Küche", "loxone"),
        _ent("switch.relay_a1b2c3", "shelly1pm-a1b2c3d4e5f6", "shelly", exposed=False, area_id=None),
        _ent("switch.kaffee", "Kaffeemaschine", "shelly"),
    )
    cand = duplicates.candidates(inv)
    base = 1_700_000_000.0
    lamp = [base + h * 3600 for h in range(10)]
    times = {
        "light.deckenlicht": lamp,
        "switch.relay_a1b2c3": [t + 1.2 for t in lamp],  # Loxone drives the Shelly
        "switch.kaffee": [base + 1800 + h * 7200 for h in range(5)],
    }
    pairs = duplicates.history_pairs(times, cand)
    assert [(p["a"], p["b"], p["together"]) for p in pairs] == [
        ("light.deckenlicht", "switch.relay_a1b2c3", 10)
    ]

    groups = duplicates.build_groups(cand, pairs)
    assert len(groups) == 1 and groups[0]["strong"]
    assert groups[0]["primary"] == "light.deckenlicht"  # a light with a real name, not the relay


def test_busy_entity_does_not_pair_with_everything():
    inv = _inv(_ent("light.a", "A", "loxone"), _ent("switch.b", "B", "shelly"))
    cand = duplicates.candidates(inv)
    base = 1_700_000_000.0
    times = {
        "light.a": [base + i * 3600 for i in range(5)],
        "switch.b": [base + i * 2 for i in range(5000)],  # toggles all the time
    }
    assert duplicates.history_pairs(times, cand) == []


def test_transitions_skip_unavailable():
    rows = [(1, "off"), (2, "on"), (3, "unavailable"), (4, "on"), (5, "off"), (6, "off")]
    assert duplicates.transitions(rows) == [2, 5]


def test_groups_join_three_systems():
    inv = _inv(
        _ent("light.lox", "Licht Esstisch", "loxone"),
        _ent("light.knx", "Licht Esstisch", "knx"),
        _ent("switch.shelly", "Esstisch", "shelly"),
    )
    cand = duplicates.candidates(inv)
    pairs = [
        {"a": "light.knx", "b": "light.lox", "kind": "name", "score": 1.0},
        {"a": "light.lox", "b": "switch.shelly", "kind": "history", "together": 8, "of": 9},
    ]
    groups = duplicates.build_groups(cand, pairs)
    assert len(groups) == 1
    assert groups[0]["key"] == "light.knx|light.lox|switch.shelly"


def test_two_systems_over_mqtt_and_not_within_one_device():
    inv = _inv(
        _ent("light.z2m_decke", "Decke", "mqtt", device_id="z2m"),
        _ent("switch.tasmota_decke", "Decke", "mqtt", device_id="tas"),
        _ent("light.decke_kanal2", "Decke", "zha", device_id="zha1"),
        _ent("switch.decke_kanal2", "Decke", "zha", device_id="zha1"),
    )
    inv["devices"] = {
        "z2m": {
            "device_id": "z2m",
            "name": "Decke",
            "manufacturer": "IKEA",
            "entity_ids": ["light.z2m_decke"],
        },
        "tas": {
            "device_id": "tas",
            "name": "Decke",
            "manufacturer": "Tasmota",
            "entity_ids": ["switch.tasmota_decke"],
        },
        "zha1": {
            "device_id": "zha1",
            "name": "Decke",
            "manufacturer": "Aqara",
            "entity_ids": ["light.decke_kanal2", "switch.decke_kanal2"],
        },
    }
    cand = duplicates.candidates(inv)
    found = {(p["a"], p["b"]) for p in duplicates.name_pairs(inv, cand)}
    assert ("light.z2m_decke", "switch.tasmota_decke") in found  # both MQTT, different bridges
    assert ("light.decke_kanal2", "switch.decke_kanal2") not in found  # one device


def test_primary_has_no_favourite_integration():
    members = [
        {
            "entity_id": "light.zigbee",
            "title": "Stehlampe",
            "platform": "mqtt",
            "kind": "light",
            "exposed": True,
            "area_id": "wz",
        },
        {
            "entity_id": "switch.loxone",
            "title": "Stehlampe",
            "platform": "loxone",
            "kind": "switch",
            "exposed": True,
            "area_id": "wz",
        },
    ]
    assert duplicates.suggest_primary(members) == "light.zigbee"


def test_groups_are_not_twins_of_their_members():
    inv = _inv(
        _ent("cover.raffstore_kueche", "Raffstore Küche", "loxone"),
        _ent("cover.raffstore_esszimmer", "Raffstore Esszimmer", "loxone"),
        _ent("cover.wohnbereich", "Wohnbereich Beschattung", "group"),
        _ent("light.hue_raum", "Wohnzimmer", "hue", is_group=True),
        _ent("light.stehlampe", "Stehlampe", "hue"),
    )
    cand = duplicates.candidates(inv)
    assert "cover.wohnbereich" not in cand and "light.hue_raum" not in cand
    base = 1_700_000_000.0
    times = {e: [base + h * 3600 for h in range(8)] for e in inv["entities"]}
    groups = duplicates.build_groups(cand, duplicates.history_pairs(times, cand))
    # the two Loxone covers are one system; the group is gone, so nothing is left to pair
    assert all("cover.wohnbereich" not in g["key"] for g in groups)
    assert not any(
        {"cover.raffstore_kueche", "cover.raffstore_esszimmer"} <= set(g["key"].split("|")) for g in groups
    )
