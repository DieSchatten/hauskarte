"""House description and map data, no Home Assistant needed."""

from custom_components.hauskarte import description
from custom_components.hauskarte.llm import parse_rooms


def _inv():
    floors = {
        "dg": {"floor_id": "dg", "name": "Dachgeschoss", "level": 2, "aliases": []},
        "og": {"floor_id": "og", "name": "Obergeschoss", "level": 1, "aliases": []},
        "eg": {"floor_id": "eg", "name": "Erdgeschoss", "level": 0, "aliases": []},
    }
    areas = {
        "kueche": {"area_id": "kueche", "name": "Küche", "floor_id": "eg", "aliases": []},
        "wohnzimmer": {"area_id": "wohnzimmer", "name": "Wohnzimmer", "floor_id": "eg", "aliases": ["Stube"]},
        "bad": {"area_id": "bad", "name": "Bad", "floor_id": "og", "aliases": []},
        "buero": {"area_id": "buero", "name": "Büro", "floor_id": "dg", "aliases": []},
        "garten": {"area_id": "garten", "name": "Garten", "floor_id": None, "aliases": []},
    }
    devices = {
        "sat": {
            "device_id": "sat",
            "name": "Voice Küche",
            "area_id": "kueche",
            "entity_ids": ["assist_satellite.voice"],
            "model": None,
        },
        "lamp": {"device_id": "lamp", "name": "Decke", "area_id": "kueche", "entity_ids": ["light.decke"]},
        "sat2": {
            "device_id": "sat2",
            "name": "Tablet",
            "area_id": None,
            "entity_ids": ["assist_satellite.tab"],
        },
    }
    entities = {
        "assist_satellite.voice": {"entity_id": "assist_satellite.voice", "domain": "assist_satellite"},
        "assist_satellite.tab": {"entity_id": "assist_satellite.tab", "domain": "assist_satellite"},
        "light.decke": {"entity_id": "light.decke", "domain": "light", "exposed": True},
    }
    for ent in entities.values():
        ent.setdefault("device_id", None)
    return {"floors": floors, "areas": areas, "devices": devices, "entities": entities}


LAYOUT = {
    "kueche": {"x": 0, "y": 0, "w": 4, "h": 3},
    "wohnzimmer": {"x": 4, "y": 0, "w": 6, "h": 3},  # shares the right edge of the kitchen
    "bad": {"x": 1, "y": 1, "w": 2, "h": 2},  # above the kitchen
    "buero": {"x": 20, "y": 10, "w": 2, "h": 2},  # above nothing
}


def test_geometry():
    assert description.touching((0, 0, 4, 3), (4, 0, 6, 3))
    assert description.touching((0, 0, 4, 3), (0, 3, 4, 2))
    assert not description.touching((0, 0, 4, 3), (4, 3, 2, 2))  # corner only
    assert not description.touching((0, 0, 4, 3), (5, 0, 2, 2))
    assert description.covering((1, 1, 2, 2), (0, 0, 4, 3))
    assert not description.covering((4, 0, 2, 2), (0, 0, 4, 3))


def test_description_text():
    text = description.build_description(_inv(), LAYOUT, {"wohnzimmer": "offen zur Küche"}, "de")
    lines = text.splitlines()
    assert lines[0] == "Aufbau des Hauses (von oben nach unten):"
    assert lines[1] == "- Dachgeschoss: Büro"
    assert lines[2] == "- Obergeschoss: Bad"
    assert lines[3] == "- Erdgeschoss: Küche, Wohnzimmer (auch: Stube)"
    assert lines[4] == "- Ohne Etage: Garten"
    assert "„Oben“ meint Obergeschoss und Dachgeschoss, „unten“ Erdgeschoss." in lines
    assert "- Küche grenzt an Wohnzimmer." in lines
    assert "- Bad liegt über Küche." in lines
    assert not any("Büro liegt über" in line for line in lines)
    assert any(line.startswith("Sprachgeräte: Küche (Voice Küche).") for line in lines)
    assert "- Wohnzimmer: offen zur Küche" in lines


def test_description_english_and_stable():
    a = description.build_description(_inv(), LAYOUT, {}, "en-GB")
    b = description.build_description(_inv(), dict(reversed(LAYOUT.items())), {}, "en-GB")
    assert a == b  # same input, same prompt: keeps the model's prompt cache warm
    assert a.startswith("Layout of the house (top to bottom):")


def test_map_data():
    m = description.build_map(
        _inv(), LAYOUT, {}, {"device:lamp"}, {"eg": {"rows": 10, "image": "data:x", "version": "v1"}}
    )
    assert [f["name"] for f in m["floors"]] == ["Dachgeschoss", "Obergeschoss", "Erdgeschoss", ""]
    eg = next(f for f in m["floors"] if f["floor_id"] == "eg")
    assert (eg["rows"], eg["image"]) == (10, "v1")
    kitchen = next(r for r in m["rooms"] if r["area_id"] == "kueche")
    assert kitchen["position"] == {"x": 0, "y": 0, "w": 4, "h": 3}
    assert [d["id"] for d in kitchen["devices"]] == ["sat", "lamp"]  # speakers first
    assert kitchen["devices"][1]["open"]
    assert m["speakers_without_area"] == [{"id": "sat2", "name": "Tablet"}]


def test_parse_rooms_clamps():
    text = '{"rooms": [{"name": "Küche", "area_id": "kueche", "x": -2, "y": 3, "w": 40, "h": 2},'
    text += ' {"name": "Flur", "area_id": "unknown", "x": 5, "y": 5, "w": 1, "h": 1}, {"name": ""}]}'
    rooms = parse_rooms(text, 24, 10, {"kueche"})
    assert rooms == [
        {"name": "Küche", "area_id": "kueche", "x": 0, "y": 3, "w": 24, "h": 2},
        {"name": "Flur", "area_id": None, "x": 5, "y": 5, "w": 1, "h": 1},
    ]


def test_map_visibility_and_tray():
    inv = _inv()
    inv["devices"]["infra"] = {
        "device_id": "infra",
        "name": "Router",
        "area_id": None,
        "entity_ids": ["sensor.rx"],
    }
    inv["entities"]["sensor.rx"] = {"entity_id": "sensor.rx", "domain": "sensor", "device_id": "infra"}
    m = description.build_map(
        inv, LAYOUT, {}, set(), pins={"lamp": {"x": 0.2, "y": 0.8}}, shown={"sat": False}
    )
    kitchen = next(r for r in m["rooms"] if r["area_id"] == "kueche")
    by_id = {d["id"]: d for d in kitchen["devices"]}
    assert by_id["lamp"]["pos"] == {"x": 0.2, "y": 0.8} and by_id["lamp"]["visible"]
    assert by_id["sat"]["visible"] is False  # chosen
    # the tablet (speaker) waits in the tray, the router (nothing exposed) does not
    assert [d["id"] for d in m["unassigned"]] == ["sat2"]


def test_things_on_the_map_readings_at_the_edge():
    inv = _inv()
    inv["devices"]["climate"] = {
        "device_id": "climate",
        "name": "Raumklima",
        "area_id": "kueche",
        "entity_ids": ["sensor.t", "sensor.h", "sensor.rssi"],
    }
    inv["devices"]["window"] = {
        "device_id": "window",
        "name": "Fenster",
        "area_id": "kueche",
        "entity_ids": ["binary_sensor.fenster"],
    }
    inv["entities"].update(
        {
            "sensor.t": {
                "entity_id": "sensor.t",
                "domain": "sensor",
                "device_class": "temperature",
                "device_id": "climate",
                "title": "Temperatur",
            },
            "sensor.h": {
                "entity_id": "sensor.h",
                "domain": "sensor",
                "device_class": "humidity",
                "device_id": "climate",
                "title": "Feuchte",
            },
            "sensor.rssi": {
                "entity_id": "sensor.rssi",
                "domain": "sensor",
                "device_id": "climate",
                "entity_category": "diagnostic",
            },
            "binary_sensor.fenster": {
                "entity_id": "binary_sensor.fenster",
                "domain": "binary_sensor",
                "device_class": "window",
                "device_id": "window",
                "title": "Fenster",
            },
            "sensor.power": {
                "entity_id": "sensor.power",
                "domain": "sensor",
                "device_class": "power",
                "device_id": "lamp",
                "title": "Leistung",
            },
        }
    )
    inv["devices"]["lamp"]["entity_ids"].append("sensor.power")
    m = description.build_map(inv, LAYOUT, {}, set(), icons={"lamp": {"mdi": "mdi:ceiling-light"}})
    kitchen = next(r for r in m["rooms"] if r["area_id"] == "kueche")
    by_id = {d["id"]: d for d in kitchen["devices"]}
    # the lamp is a thing: a symbol, switched through its light entity, with its own icon
    assert by_id["lamp"]["physical"] and by_id["lamp"]["entity_id"] == "light.decke"
    assert by_id["lamp"]["icon"] == {"mdi": "mdi:ceiling-light"}
    # climate sensor and window contact are readings, not symbols
    assert not by_id["climate"]["physical"] and not by_id["window"]["physical"]
    # readings: most telling first; diagnostic and unexposed power stay out
    assert [s["entity_id"] for s in kitchen["sensors"]] == ["sensor.t", "sensor.h", "binary_sensor.fenster"]
