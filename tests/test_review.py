"""AI review: answers are checked against what exists, no Home Assistant needed."""

from custom_components.hauskarte import review

INV = {
    "floors": {
        "main": {"floor_id": "main", "name": "Upper Floor", "level": 2},
        "ground": {"floor_id": "ground", "name": "Ground Level", "level": 0},
    },
    "areas": {
        "wg": {"area_id": "wg", "name": "Gästezimmer", "floor_id": None},
        "kueche": {"area_id": "kueche", "name": "Küche", "floor_id": "main"},
    },
    "devices": {},
    "entities": {},
}


def test_floors_only_real_changes_and_known_ids():
    answer = {
        "floors": [
            {
                "floor_id": "main",
                "name": "Obere Wohnung",
                "level": 2,
                "reason": "Küche, Wohnzimmer",
                "confidence": 0.8,
            },
            {"floor_id": "ground", "name": "Ground Level", "level": 0},  # unchanged → dropped
            {"floor_id": "made_up", "name": "Keller"},
        ],
        "rooms": [
            {"area_id": "wg", "floor_id": "main", "reason": "neben dem Wohnzimmer", "confidence": "0.6"},
            {"area_id": "kueche", "floor_id": "ground"},  # has a floor, AI says elsewhere
            {"area_id": "kueche", "floor_id": "main"},  # already there → dropped
            {"area_id": "wg", "floor_id": "nowhere"},
        ],
    }
    out = review.parse_floors(answer, INV)
    assert [(f["floor_id"], f["old_name"], f["name"]) for f in out["floors"]] == [
        ("main", "Upper Floor", "Obere Wohnung")
    ]
    # rooms with a floor may be suggested elsewhere too (two bathrooms); the current floor comes along
    assert [(r["area_id"], r["current_floor_id"], r["floor_id"]) for r in out["rooms"]] == [
        ("wg", None, "main"),
        ("kueche", "main", "ground"),
    ]
    assert out["rooms"][0]["confidence"] == 0.6
    task = review.floors_task(INV, {"kueche": ["light: Deckenlicht Küche"]}, "de")
    assert '"Upper Floor"' in task and "Deckenlicht Küche" in task and "current_floor_id" in task


def test_duplicates_primary_must_be_a_member():
    groups = [{"key": "a|b", "evidence": [], "members": [{"entity_id": "a"}, {"entity_id": "b"}]}]
    out = review.parse_duplicates(
        {"groups": [{"key": "a|b", "same": True, "primary": "c"}, {"key": "x"}]}, groups
    )
    assert out == {"a|b": {"same": True, "primary": None, "reason": "", "confidence": 0.5}}


def test_advice_values_are_limited():
    orphans = [{"integration": "template", "running": True, "entities": []}]
    assert (
        review.parse_orphans({"groups": [{"integration": "template", "advice": "burn"}]}, orphans)[
            "template"
        ]["advice"]
        == "check"
    )
    silent = [{"device_id": "d", "deletable": False}]
    # cannot delete what the integration does not allow to delete
    assert (
        review.parse_silent({"devices": [{"device_id": "d", "advice": "delete"}]}, silent)["d"]["advice"]
        == "disable"
    )


def test_functions_never_switch_off_what_is_used():
    devices = [
        {
            "device_id": "d",
            "functions": [
                {"entity_id": "sensor.power", "used_in": 2},
                {"entity_id": "sensor.rssi", "used_in": 0},
            ],
        }
    ]
    out = review.parse_functions(
        {
            "devices": [
                {
                    "device_id": "d",
                    "what": "Zwischenstecker",
                    "functions": [
                        {"entity_id": "sensor.power", "status": "disabled", "reason": "x"},
                        {"entity_id": "sensor.rssi", "status": "disabled", "reason": "y"},
                        {"entity_id": "sensor.rssi2", "status": "disabled"},
                        {"entity_id": "sensor.rssi", "status": "gone"},
                    ],
                },
                {"device_id": "unknown", "functions": []},
            ]
        },
        devices,
    )
    assert list(out) == ["d"]
    assert out["d"]["functions"]["sensor.power"]["status"] == "hidden"  # an automation uses it
    assert out["d"]["functions"]["sensor.rssi"]["status"] == "disabled"
    assert "sensor.rssi2" not in out["d"]["functions"]
