"""One list of suggestions per unit, no Home Assistant needed."""

from custom_components.hauskarte import units


def _row(entity_id, exposed, proposed_exposed, status=None, aliases=None):
    return {
        "entity_id": entity_id,
        "current": {"exposed": exposed, "aliases": [], "status": status},
        "proposed": {"exposed": proposed_exposed, "aliases": aliases or [], "remove": False},
        "reasons": [{"code": "category"}],
    }


def _fn(entity_id, domain, kind, status, ai=None):
    return {"entity_id": entity_id, "domain": domain, "kind": kind, "status": status, "ai": ai}


def test_rules_and_ai_in_one_list_ai_wins():
    prop = {
        "id": "device:d",
        "source": "rule",
        "reasons": [{"code": "area_from_name", "area": "Büro"}],
        "current": {"area_id": None, "name": None},
        "proposed": {"area_id": "buero", "name": None},
        "entities": [
            _row("sensor.rssi", True, False, "assistant"),
            _row("switch.k", True, True, "assistant", ["Licht"]),
        ],
    }
    fns = [
        _fn(
            "sensor.rssi",
            "sensor",
            "sensor",
            "assistant",
            {"status": "disabled", "kind": None, "reason": "Funk"},
        ),
        _fn(
            "switch.k",
            "switch",
            "switch",
            "assistant",
            {"status": None, "kind": "light", "reason": "Shelly am Licht"},
        ),
    ]
    out = {s["id"]: s for s in units.suggestions([prop], fns)}
    assert out["area"]["value"] == "buero"
    assert out["status:sensor.rssi"]["value"] == "disabled" and out["status:sensor.rssi"]["source"] == "ai"
    assert out["aliases:switch.k"]["value"] == ["Licht"]
    assert out["kind:switch.k"]["value"] == "light"
    # a switch that is a light: HA should show it as one, or the assistant does not understand "light …"
    assert out["convert:switch.k"]["value"] == "light"


def test_no_conversion_when_already_shown_or_hidden():
    shown = _fn("switch.a", "switch", "light", "assistant")
    shown["wrapped_as"] = "light.a"
    hidden = _fn("switch.b", "switch", "light", "hidden")
    socket = _fn("switch.c", "switch", "socket", "assistant")
    assert units.suggestions([], [shown, hidden, socket]) == []


def test_kind_before_conversion_and_done_until_new_functions():
    chosen = [{"type": "convert"}, {"type": "kind"}, {"type": "area"}]
    assert [s["type"] for s in units.apply_order(chosen)] == ["area", "kind", "convert"]
    assert (
        units.fingerprint(["b", "a"]) == units.fingerprint(["a", "b"]) != units.fingerprint(["a", "b", "c"])
    )


def test_what_was_changed_by_hand_is_not_suggested_again():
    row = _row("light.a", True, True, "assistant", ["Deckenlicht"])
    row["now"] = {
        "status": "assistant",
        "exposed": True,
        "aliases": ["Deckenlicht", "Licht oben"],
    }  # typed since
    off = _row("sensor.rssi", True, False, "assistant")
    off["now"] = {"status": "disabled", "exposed": False, "aliases": []}  # switched off by hand since
    prop = {
        "id": "device:d",
        "source": "rule",
        "reasons": [],
        "current": {"area_id": None, "name": None},
        "now": {"area_id": "bad", "name": None},  # room chosen by hand meanwhile
        "proposed": {"area_id": "kueche", "name": None},
        "entities": [row, off],
    }
    assert units.suggestions([prop], []) == []


def test_disabled_stays_disabled_and_config_switches_are_no_lights():
    row = _row("sensor.rssi", False, False)
    row["now"] = {"status": "disabled", "exposed": False, "aliases": []}
    assert units.proposed_status(row) == "disabled"
    config = _fn("switch.led_anzeige", "switch", "light", "ha")
    config["technical"] = True
    assert units.suggestions([], [config]) == []


def test_done_until_new_functions_only():
    assert units.still_done("a|b", ["a"])  # one went away: still done
    assert not units.still_done("a|b", ["a", "b", "c"])  # a new one: back in the queue
    assert not units.still_done(None, ["a"])
