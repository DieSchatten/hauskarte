"""The status ladder, no Home Assistant needed."""

from custom_components.hauskarte import status


def test_ladder_has_one_direction():
    assert status.entity_status(exposed=True, hidden=False, disabled=False) == "assistant"
    assert status.entity_status(exposed=False, hidden=False, disabled=False) == "ha"
    # what HA hides, the assistant does not get – even if it was exposed
    assert status.entity_status(exposed=True, hidden=True, disabled=False) == "hidden"
    assert status.entity_status(exposed=True, hidden=True, disabled=True) == "disabled"


def test_roles():
    assert status.role("climate", None) == "control"
    assert status.role("sensor", None) == "measure"
    assert status.role("sensor", "diagnostic") == "technical"
    assert status.role("update", None) == "other"


def _fn(entity_id, current, technical=False):
    return {"entity_id": entity_id, "status": current, "technical": technical}


def test_device_status_is_the_most_visible_own_function():
    fns = [_fn("climate.a", "ha"), _fn("sensor.t", "assistant"), _fn("sensor.rssi", "assistant", True)]
    assert status.device_status(fns) == "assistant"
    assert status.device_status([_fn("sensor.rssi", "hidden", True)]) == "hidden"
    assert status.device_status([]) is None


def test_device_status_is_a_ceiling():
    fns = [
        _fn("climate.a", "assistant"),
        _fn("sensor.t", "hidden"),
        _fn("sensor.rssi", "assistant", True),
        _fn("sensor.wifi", "disabled", True),
    ]
    assert status.targets_for_device(fns, "ha") == {"climate.a": "ha", "sensor.t": "ha", "sensor.rssi": "ha"}
    assert status.targets_for_device(fns, "hidden") == {
        "climate.a": "hidden",
        "sensor.rssi": "hidden",
    }
    # up to the assistant: only the device's own functions, never a diagnostic value
    assert status.targets_for_device(fns, "assistant") == {"sensor.t": "assistant"}
