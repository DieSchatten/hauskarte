"""Constants for Hauskarte."""

from __future__ import annotations

DOMAIN = "hauskarte"
VERSION = "0.14.4"

PANEL_URL = "hauskarte"
STATIC_URL = "/hauskarte_static"

STORAGE_KEY = "hauskarte.data"
STORAGE_VERSION = 1

# The assistant whose exposure settings we manage (Assist / conversation agents).
ASSISTANT = "conversation"

CONF_LLM_MODE = "llm_mode"
CONF_AI_TASK_ENTITY = "ai_task_entity"
CONF_API_URL = "api_url"
CONF_API_KEY = "api_key"
CONF_MODEL = "model"
CONF_BATCH_SIZE = "batch_size"

LLM_NONE = "none"
LLM_AI_TASK = "ai_task"
LLM_OPENAI = "openai"
LLM_MODES = [LLM_NONE, LLM_AI_TASK, LLM_OPENAI]

DEFAULT_BATCH_SIZE = 8

# Proposals at or above this confidence may be applied in bulk.
SAFE_CONFIDENCE = 0.9
# LLM proposals are never "safe": the user always looks at them.
LLM_MAX_CONFIDENCE = 0.8

UNDO_LIMIT = 1000

STATUS_OPEN = "open"
STATUS_LATER = "later"
STATUS_IGNORED = "ignored"
STATUS_DONE = "done"

CONF_WATCH = "watch_new_devices"
# New devices often get their entities and area a little after they appear.
WATCH_DELAY = 120

SIGNAL_CHANGED = f"{DOMAIN}_changed"
ISSUE_NEW = "new_proposals"
SENSOR_UNIQUE_ID = "house_description"

MAX_IMAGE_LENGTH = 3_000_000  # data URL characters, ~2 MB of JPEG
