"""Repairs entry for new proposals."""

from __future__ import annotations

from typing import Any

from homeassistant.components.repairs import RepairsFlow
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult

from .const import DOMAIN


class NewProposalsFlow(RepairsFlow):
    """Apply the safe ones right here, or close the entry and review on the panel."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        return self.async_show_menu(step_id="init", menu_options=["apply_safe", "seen"])

    async def async_step_apply_safe(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        if (manager := self.hass.data.get(DOMAIN)) is not None:
            manager.apply_safe()
            manager.mark_seen()
        return self.async_create_entry(data={})

    async def async_step_seen(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        if (manager := self.hass.data.get(DOMAIN)) is not None:
            manager.mark_seen()
        return self.async_create_entry(data={})


async def async_create_fix_flow(
    hass: HomeAssistant, issue_id: str, data: dict[str, Any] | None
) -> RepairsFlow:
    return NewProposalsFlow()
