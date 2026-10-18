"""Fixtures for Hauskarte tests."""

from unittest.mock import AsyncMock, patch

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Allow loading custom_components/ in every test."""
    yield


@pytest.fixture
async def ha_base(hass: HomeAssistant):
    """Core pieces the integration relies on, without the real frontend."""
    assert await async_setup_component(hass, "homeassistant", {})
    # The real frontend needs the hass_frontend package; the panel is patched instead.
    hass.config.components.update({"frontend", "panel_custom"})
    with (
        patch("custom_components.hauskarte.async_register_panel", AsyncMock()),
        patch("custom_components.hauskarte.frontend.async_remove_panel"),
    ):
        yield hass
