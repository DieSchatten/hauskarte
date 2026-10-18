"""Rule tests on a plain inventory, no Home Assistant needed."""

from custom_components.hauskarte import rules
from custom_components.hauskarte.llm import parse_answer


def _inv(devices=None, entities=None):
    inv = {
        "floors": {"eg": {"floor_id": "eg", "name": "Erdgeschoss", "level": 0, "aliases": []}},
        "areas": {
            "kueche": {"area_id": "kueche", "name": "Küche", "floor_id": "eg", "aliases": []},
            "wohnzimmer": {
                "area_id": "wohnzimmer",
                "name": "Wohnzimmer",
                "floor_id": "eg",
                "aliases": ["Stube"],
            },
            "bad": {"area_id": "bad", "name": "Bad", "floor_id": None, "aliases": []},
        },
        "devices": {},
        "entities": {},
    }
    for dev in devices or []:
        inv["devices"][dev["device_id"]] = {
            "name_by_user": None,
            "default_name": dev.get("name"),
            "manufacturer": None,
            "model": None,
            "area_id": None,
            "integration": "test",
            "entry_ok": True,
            "service": False,
            "entity_ids": [],
            **dev,
        }
    for ent in entities or []:
        ent = {
            "device_id": None,
            "name": None,
            "title": ent["entity_id"],
            "area_id": None,
            "entity_category": None,
            "hidden": False,
            "device_class": None,
            "aliases": [],
            "exposed": False,
            "restored": False,
            "entry_ok": True,
            "platform": "test",
            "domain": ent["entity_id"].split(".")[0],
            **ent,
        }
        inv["entities"][ent["entity_id"]] = ent
        if ent["device_id"]:
            inv["devices"][ent["device_id"]]["entity_ids"].append(ent["entity_id"])
    return inv


def test_normalize_and_compounds():
    assert rules.normalize("Küchen-Lampe") == "kuechen lampe"
    assert rules.area_from_name(_inv()["areas"], "Küchenlampe") == ("kueche", 0.9)
    assert rules.area_from_name(_inv()["areas"], "Stube Ecklicht") == ("wohnzimmer", 0.9)
    # short names only as whole words
    assert rules.area_from_name(_inv()["areas"], "Badlicht") is None
    assert rules.area_from_name(_inv()["areas"], "Licht Bad") == ("bad", 0.9)
    assert rules.area_from_name(_inv()["areas"], "Steckdose") is None


def test_technical_names():
    for name in ["0x00158d0001a2b3c4", "shelly1-a4cf12", "AA:BB:CC:DD:EE:FF", "sensor_42", "", None]:
        assert rules.looks_technical(name), name
    for name in ["Deckenlampe", "Kaffeemaschine", "Hue Go"]:
        assert not rules.looks_technical(name), name


def test_area_from_device_name_is_safe():
    inv = _inv(
        devices=[{"device_id": "d1", "name": "Küche Deckenlampe"}],
        entities=[
            {"entity_id": "light.decke", "device_id": "d1", "exposed": True},
            {"entity_id": "sensor.rssi", "device_id": "d1", "entity_category": "diagnostic"},
        ],
    )
    prop = rules.build_proposals(inv)["device:d1"]
    assert prop["proposed"]["area_id"] == "kueche"
    assert prop["safe"]
    assert prop["main_entity"] == "light.decke"


def test_diagnostic_exposed_gets_hidden():
    inv = _inv(
        devices=[{"device_id": "d1", "name": "Lampe", "area_id": "bad"}],
        entities=[
            {"entity_id": "light.lampe", "device_id": "d1", "exposed": True},
            {"entity_id": "sensor.fw", "device_id": "d1", "entity_category": "diagnostic", "exposed": True},
        ],
    )
    prop = rules.build_proposals(inv)["device:d1"]
    row = next(r for r in prop["entities"] if r["entity_id"] == "sensor.fw")
    assert row["proposed"]["exposed"] is False
    assert prop["safe"]


def test_nothing_to_do_gives_no_proposal():
    inv = _inv(
        devices=[{"device_id": "d1", "name": "Lampe", "area_id": "bad"}],
        entities=[{"entity_id": "light.lampe", "device_id": "d1", "exposed": True}],
    )
    assert rules.build_proposals(inv) == {}


def test_open_questions_are_not_safe_and_go_to_llm():
    inv = _inv(
        devices=[{"device_id": "d1", "name": "0x00158d0001a2b3c4"}],
        entities=[{"entity_id": "switch.plug", "device_id": "d1", "exposed": True}],
    )
    prop = rules.build_proposals(inv)["device:d1"]
    assert set(prop["flags"]) == {"area_missing", "name_technical"}
    assert not prop["safe"]
    assert rules.needs_llm(prop)

    merged = rules.merge_llm(
        prop,
        {
            "area_id": "kueche",
            "name": "Kaffeemaschine",
            "aliases": ["Kaffee"],
            "relevant": True,
            "confidence": 0.99,
        },
        inv,
    )
    assert merged["proposed"] == {"area_id": "kueche", "name": "Kaffeemaschine"}
    assert merged["entities"][0]["proposed"]["aliases"] == ["Kaffee"]
    assert merged["confidence"] == 0.8  # capped
    assert not merged["safe"]
    assert merged["source"] == "llm"


def test_llm_cannot_invent_areas_or_technical_names():
    inv = _inv(
        devices=[{"device_id": "d1", "name": "0x00158d0001a2b3c4"}],
        entities=[{"entity_id": "switch.plug", "device_id": "d1", "exposed": True}],
    )
    prop = rules.build_proposals(inv)["device:d1"]
    merged = rules.merge_llm(prop, {"area_id": "keller", "name": "plug_0x1234"}, inv)
    assert merged["proposed"] == {"area_id": None, "name": None}
    assert merged["source"] == "rule"


def test_llm_irrelevant_unexposes():
    inv = _inv(
        devices=[{"device_id": "d1", "name": "0x00158d0001a2b3c4"}],
        entities=[{"entity_id": "switch.router_led", "device_id": "d1", "exposed": True}],
    )
    prop = rules.build_proposals(inv)["device:d1"]
    merged = rules.merge_llm(prop, {"relevant": False, "confidence": 0.7}, inv)
    assert merged["entities"][0]["proposed"]["exposed"] is False


def test_orphans_are_listed_not_proposed():
    inv = _inv(
        devices=[{"device_id": "d1", "name": "Drucker", "area_id": "bad"}],
        entities=[
            {"entity_id": "sensor.ams_slot", "device_id": "d1", "restored": True, "exposed": True},
            {"entity_id": "sensor.duese", "device_id": "d1"},
            {"entity_id": "light.alt", "restored": True, "exposed": True, "platform": "template"},
        ],
    )
    # never a removal proposal: restored often only means "offline right now"
    props = rules.build_proposals(inv)
    assert not any(r["proposed"]["remove"] for p in props.values() for r in p["entities"])
    groups = {g["integration"]: g for g in rules.orphans(inv)}
    assert [e["entity_id"] for e in groups["test"]["entities"]] == ["sensor.ams_slot"]
    assert groups["test"]["entities"][0]["device_live"] is True  # the printer itself still reports
    assert groups["template"]["entities"][0]["device"] is None


def test_fingerprint_changes_with_state():
    inv = _inv(
        devices=[{"device_id": "d1", "name": "Lampe"}],
        entities=[{"entity_id": "light.lampe", "device_id": "d1", "exposed": True}],
    )
    before = rules.fingerprint(inv, "device:d1")
    inv["devices"]["d1"]["area_id"] = "bad"
    assert rules.fingerprint(inv, "device:d1") != before


def test_parse_answer_tolerates_chatter():
    text = '<think>hmm</think>Sure! ```json\n{"devices": [{"id": "device:a", "name": "X"}, {"no": 1}]}\n```'
    assert parse_answer(text) == [{"id": "device:a", "name": "X"}]
