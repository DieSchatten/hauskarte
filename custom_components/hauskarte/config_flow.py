"""Config flow: where proposals for the gaps come from."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback
from homeassistant.helpers import selector

from .const import (
    CONF_AI_TASK_ENTITY,
    CONF_API_KEY,
    CONF_API_URL,
    CONF_BATCH_SIZE,
    CONF_LLM_MODE,
    CONF_MODEL,
    CONF_WATCH,
    DEFAULT_BATCH_SIZE,
    DOMAIN,
    LLM_AI_TASK,
    LLM_MODES,
    LLM_NONE,
    LLM_OPENAI,
)


def _schema(values: dict[str, Any]) -> vol.Schema:
    def default(key: str, fallback: Any = vol.UNDEFINED) -> dict:
        value = values.get(key, fallback)
        return {} if value in (None, "", vol.UNDEFINED) else {"default": value}

    return vol.Schema(
        {
            vol.Required(CONF_LLM_MODE, **default(CONF_LLM_MODE, LLM_NONE)): selector.SelectSelector(
                selector.SelectSelectorConfig(options=LLM_MODES, translation_key=CONF_LLM_MODE)
            ),
            vol.Optional(CONF_AI_TASK_ENTITY, **default(CONF_AI_TASK_ENTITY)): selector.EntitySelector(
                selector.EntitySelectorConfig(domain="ai_task")
            ),
            vol.Optional(CONF_API_URL, **default(CONF_API_URL)): selector.TextSelector(
                selector.TextSelectorConfig(type=selector.TextSelectorType.URL)
            ),
            vol.Optional(CONF_MODEL, **default(CONF_MODEL)): str,
            vol.Optional(CONF_API_KEY, **default(CONF_API_KEY)): selector.TextSelector(
                selector.TextSelectorConfig(type=selector.TextSelectorType.PASSWORD)
            ),
            vol.Required(CONF_BATCH_SIZE, default=values.get(CONF_BATCH_SIZE, DEFAULT_BATCH_SIZE)): vol.All(
                vol.Coerce(int), vol.Range(min=1, max=30)
            ),
            vol.Required(CONF_WATCH, default=values.get(CONF_WATCH, True)): bool,
        }
    )


def _validate(user_input: dict[str, Any]) -> dict[str, str]:
    errors: dict[str, str] = {}
    mode = user_input[CONF_LLM_MODE]
    if mode == LLM_AI_TASK and not user_input.get(CONF_AI_TASK_ENTITY):
        errors[CONF_AI_TASK_ENTITY] = "required"
    if mode == LLM_OPENAI:
        if not user_input.get(CONF_API_URL):
            errors[CONF_API_URL] = "required"
        if not user_input.get(CONF_MODEL):
            errors[CONF_MODEL] = "required"
    return errors


class HauskarteConfigFlow(ConfigFlow, domain=DOMAIN):
    """Single instance; everything else is in the options."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()
        errors: dict[str, str] = {}
        if user_input is not None:
            errors = _validate(user_input)
            if not errors:
                return self.async_create_entry(title="Hauskarte", data={}, options=user_input)
        return self.async_show_form(step_id="user", data_schema=_schema(user_input or {}), errors=errors)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return HauskarteOptionsFlow()


class HauskarteOptionsFlow(OptionsFlow):
    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            errors = _validate(user_input)
            if not errors:
                return self.async_create_entry(data=user_input)
        return self.async_show_form(
            step_id="init",
            data_schema=_schema(user_input or dict(self.config_entry.options)),
            errors=errors,
        )
