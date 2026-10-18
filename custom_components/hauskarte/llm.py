"""Ask a language model to fill the gaps the rules leave open."""

from __future__ import annotations

import json
import logging
import re

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    CONF_AI_TASK_ENTITY,
    CONF_API_KEY,
    CONF_API_URL,
    CONF_LLM_MODE,
    CONF_MODEL,
    LLM_AI_TASK,
    LLM_OPENAI,
)

_LOGGER = logging.getLogger(__name__)

TIMEOUT = aiohttp.ClientTimeout(total=300)

# Kept identical across batches so OpenAI-compatible servers can reuse the
# prompt cache; only the device list at the end changes.
SYSTEM_PROMPT = """You help tidy up a Home Assistant installation so that a voice assistant understands it.
For every device you get its current name, manufacturer, model, integration and entities.
Decide for each device:
- area_id: the room it is in, chosen ONLY from the area list below, or null if you are not sure.
- name: a short natural name a person would say, in the language "{language}", that tells what the
  device is or does (e.g. "Ceiling light", "Coffee machine"). Do not repeat the room in the name.
  null if you cannot tell.
- aliases: up to 3 other ways people would refer to it when speaking, in "{language}". May be empty.
- relevant: false for pure infrastructure nobody controls by voice (routers, bridges, coordinators,
  repeaters, network adapters, servers, firmware helpers), otherwise true.
- confidence: 0.0 to 1.0, how sure you are about area and name.
- reason: a few words why, in "{language}".

Areas (area_id: name [floor]):
{areas}

Answer with JSON only, no other text:
{{"devices": [{{"id": "...", "area_id": null, "name": null, "aliases": [], "relevant": true, "confidence": 0.5, "reason": "..."}}]}}"""


class LLMError(Exception):
    """The model could not be reached or answered nonsense."""


def configured(options: dict) -> bool:
    mode = options.get(CONF_LLM_MODE)
    if mode == LLM_AI_TASK:
        return bool(options.get(CONF_AI_TASK_ENTITY))
    if mode == LLM_OPENAI:
        return bool(options.get(CONF_API_URL) and options.get(CONF_MODEL))
    return False


def system_prompt(inv: dict, language: str) -> str:
    floors = inv["floors"]
    lines = []
    for area in sorted(inv["areas"].values(), key=lambda a: a["name"]):
        floor = floors.get(area.get("floor_id") or "")
        names = ", ".join([area["name"], *area.get("aliases", [])])
        lines.append(f"- {area['area_id']}: {names}" + (f" [{floor['name']}]" if floor else ""))
    return SYSTEM_PROMPT.format(language=language, areas="\n".join(lines) or "- (none)")


def device_payload(inv: dict, prop: dict) -> dict:
    dev_id = prop["id"].split(":", 1)[1]
    dev = inv["devices"][dev_id]
    return {
        "id": prop["id"],
        "name": dev.get("name"),
        "manufacturer": dev.get("manufacturer"),
        "model": dev.get("model"),
        "integration": dev.get("integration"),
        "entities": [
            {
                "domain": inv["entities"][e]["domain"],
                "name": inv["entities"][e].get("title"),
                "device_class": inv["entities"][e].get("device_class"),
            }
            for e in dev["entity_ids"][:8]
        ],
    }


def parse_json(text: str) -> dict:
    """The JSON object in a model answer, tolerating thinking and chatter around it."""
    text = re.sub(r"<think>.*?</think>", "", text or "", flags=re.DOTALL)
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end <= start:
        raise LLMError("no JSON in answer")
    try:
        data = json.loads(text[start : end + 1])
    except json.JSONDecodeError as err:
        raise LLMError(f"invalid JSON: {err}") from err
    if not isinstance(data, dict):
        raise LLMError("answer is not a JSON object")
    return data


def parse_answer(text: str) -> list[dict]:
    """Pull the device list out of a model answer."""
    data = parse_json(text)
    devices = data.get("devices")
    if not isinstance(devices, list):
        raise LLMError("answer has no device list")
    return [d for d in devices if isinstance(d, dict) and isinstance(d.get("id"), str)]


async def _ask_openai(hass: HomeAssistant, options: dict, system: str, user: str) -> str:
    url = options[CONF_API_URL].rstrip("/") + "/chat/completions"
    headers = {}
    if key := options.get(CONF_API_KEY):
        headers["Authorization"] = f"Bearer {key}"
    body = {
        "model": options[CONF_MODEL],
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
        "temperature": 0.2,
        "max_tokens": 4000,
        "response_format": {"type": "json_object"},
    }
    session = async_get_clientsession(hass)
    try:
        async with session.post(url, json=body, headers=headers, timeout=TIMEOUT) as resp:
            if resp.status >= 400:
                raise LLMError(f"HTTP {resp.status}: {(await resp.text())[:200]}")
            data = await resp.json(content_type=None)
    except (aiohttp.ClientError, TimeoutError) as err:
        raise LLMError(f"{type(err).__name__}: {err}") from err
    try:
        msg = data["choices"][0]["message"]
    except (KeyError, IndexError, TypeError) as err:
        raise LLMError("unexpected answer format") from err
    # Reasoning models may leave content empty and answer in reasoning_content.
    return msg.get("content") or msg.get("reasoning_content") or ""


async def _ask_ai_task(hass: HomeAssistant, options: dict, system: str, user: str) -> str:
    try:
        result = await hass.services.async_call(
            "ai_task",
            "generate_data",
            {
                "task_name": "Hauskarte",
                "entity_id": options[CONF_AI_TASK_ENTITY],
                "instructions": f"{system}\n\nDevices:\n{user}",
            },
            blocking=True,
            return_response=True,
        )
    except Exception as err:
        raise LLMError(f"{type(err).__name__}: {err}") from err
    data = (result or {}).get("data")
    return data if isinstance(data, str) else json.dumps(data)


async def ask_json(hass: HomeAssistant, options: dict, system: str, user: str) -> dict:
    """One question to the configured model, answered as a JSON object."""
    if options.get(CONF_LLM_MODE) == LLM_AI_TASK:
        return parse_json(await _ask_ai_task(hass, options, system, user))
    return parse_json(await _ask_openai(hass, options, system, user))


async def suggest(hass: HomeAssistant, options: dict, inv: dict, props: list[dict]) -> dict[str, dict]:
    """Suggestions for a batch of device proposals, keyed by proposal id."""
    system = system_prompt(inv, hass.config.language)
    user = json.dumps([device_payload(inv, p) for p in props], ensure_ascii=False, indent=1)
    if options.get(CONF_LLM_MODE) == LLM_AI_TASK:
        text = await _ask_ai_task(hass, options, system, user)
    else:
        text = await _ask_openai(hass, options, system, user)
    wanted = {p["id"] for p in props}
    result = {d["id"]: d for d in parse_answer(text) if d["id"] in wanted}
    _LOGGER.debug("LLM answered %d of %d devices", len(result), len(props))
    return result


PLAN_PROMPT = """This is the floor plan of one floor ("{floor}"). A grid has been drawn over it:
{cols} columns numbered 0 to {last_col} from left to right, {rows} rows numbered 0 to {last_row} from top to bottom.
List every room on this plan. For each room give:
- name: as written on the plan, otherwise a fitting room name, in the language "{language}"
- area_id: the id from the list of known rooms below if it is clearly the same room, otherwise null
- x, y: the column and row of its top left grid cell; w, h: its width and height in grid cells
Ignore walls, doors, furniture and labels that are not rooms.

Known rooms (area_id: name):
{areas}

Answer with JSON only, no other text:
{{"rooms": [{{"name": "...", "area_id": null, "x": 0, "y": 0, "w": 1, "h": 1}}]}}"""


def parse_rooms(text: str, cols: int, rows: int, known: set[str]) -> list[dict]:
    """Rooms from a model answer, clamped to the grid."""
    text = re.sub(r"<think>.*?</think>", "", text or "", flags=re.DOTALL)
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end <= start:
        raise LLMError("no JSON in answer")
    try:
        data = json.loads(text[start : end + 1])
    except json.JSONDecodeError as err:
        raise LLMError(f"invalid JSON: {err}") from err
    result = []
    for room in data.get("rooms", []) if isinstance(data, dict) else []:
        if not isinstance(room, dict) or not isinstance(room.get("name"), str) or not room["name"].strip():
            continue
        try:
            x, y, w, h = (int(room[k]) for k in "xywh")
        except (KeyError, TypeError, ValueError):
            continue
        x = min(max(x, 0), cols - 1)
        y = min(max(y, 0), rows - 1)
        area_id = room.get("area_id") if room.get("area_id") in known else None
        result.append(
            {
                "name": room["name"].strip()[:60],
                "area_id": area_id,
                "x": x,
                "y": y,
                "w": min(max(w, 1), cols - x),
                "h": min(max(h, 1), rows - y),
            }
        )
    return result


async def detect_rooms(
    hass: HomeAssistant, options: dict, inv: dict, floor_name: str, image: str, cols: int, rows: int
) -> list[dict]:
    """Ask a vision model for the rooms on a floor plan (image = data URL with grid drawn on)."""
    if options.get(CONF_LLM_MODE) != LLM_OPENAI or not configured(options):
        raise LLMError("floor plan detection needs an OpenAI compatible server with a vision model")
    areas = "\n".join(
        f"- {a['area_id']}: {a['name']}" for a in sorted(inv["areas"].values(), key=lambda a: a["name"])
    )
    prompt = PLAN_PROMPT.format(
        floor=floor_name,
        cols=cols,
        last_col=cols - 1,
        rows=rows,
        last_row=rows - 1,
        language=hass.config.language,
        areas=areas or "- (none)",
    )
    url = options[CONF_API_URL].rstrip("/") + "/chat/completions"
    headers = {"Authorization": f"Bearer {options[CONF_API_KEY]}"} if options.get(CONF_API_KEY) else {}
    body = {
        "model": options[CONF_MODEL],
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image}},
                ],
            }
        ],
        "temperature": 0.1,
        "max_tokens": 3000,
    }
    session = async_get_clientsession(hass)
    try:
        async with session.post(url, json=body, headers=headers, timeout=TIMEOUT) as resp:
            if resp.status >= 400:
                raise LLMError(f"HTTP {resp.status}: {(await resp.text())[:200]}")
            data = await resp.json(content_type=None)
        msg = data["choices"][0]["message"]
    except (aiohttp.ClientError, TimeoutError) as err:
        raise LLMError(f"{type(err).__name__}: {err}") from err
    except (KeyError, IndexError, TypeError) as err:
        raise LLMError("unexpected answer format") from err
    text = msg.get("content") or msg.get("reasoning_content") or ""
    return parse_rooms(text, cols, rows, set(inv["areas"]))
