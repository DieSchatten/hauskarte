"""Scan, keep decisions, apply and undo."""

from __future__ import annotations

import asyncio
import hashlib
import logging
import uuid
from collections.abc import Callable
from datetime import timedelta
from typing import Any

from homeassistant.components.homeassistant.exposed_entities import (
    async_expose_entity,
    async_should_expose,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import floor_registry as fr
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers import label_registry as lr
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from . import description, duplicates, kinds, llm, review, rules
from .const import (
    ASSISTANT,
    CONF_BATCH_SIZE,
    DEFAULT_BATCH_SIZE,
    DOMAIN,
    ISSUE_NEW,
    MAX_IMAGE_LENGTH,
    SENSOR_UNIQUE_ID,
    SIGNAL_CHANGED,
    STATUS_DONE,
    STATUS_IGNORED,
    STATUS_LATER,
    STATUS_OPEN,
    STORAGE_KEY,
    STORAGE_VERSION,
    UNDO_LIMIT,
    VERSION,
)
from .inventory import (
    alias_strings,
    build_aliases,
    build_inventory,
    deserialize_aliases,
    device_entries,
    device_entry_id,
    serialize_aliases,
)
from .rules import looks_technical

_LOGGER = logging.getLogger(__name__)


def values_from_proposal(prop: dict) -> dict:
    """The values to write when a proposal is accepted as it is."""
    return {
        "area_id": prop["proposed"]["area_id"],
        "name": prop["proposed"]["name"],
        "entities": {
            r["entity_id"]: {
                "exposed": r["proposed"]["exposed"],
                "aliases": r["proposed"]["aliases"],
                "remove": r["proposed"]["remove"],
            }
            for r in prop["entities"]
        },
    }


class HauskarteManager:
    """State of one Hauskarte installation."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self._store: Store[dict] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self.data: dict[str, Any] = {
            "proposals": {},
            "decisions": {},
            "undo": [],
            "last_scan": None,
            "layout": {},
            "notes": {},
            "plans": {},
            "seen": [],
            "pins": {},
            "shown": {},
            "duplicates": [],
            "dup_decisions": {},
            "merged": {},
            "history_checked": False,
            "ai": {},
            "kind_override": {},
            "wizard": {"pos": None, "done": [], "finished": False, "dismissed": False},
            "icons": {},
            "groups": [],
            "irrelevant": {},
        }
        self.progress: dict[str, Any] = {
            "running": False,
            "phase": None,
            "done": 0,
            "total": 0,
            "error": None,
        }
        self._scan_task: asyncio.Task | None = None
        self._watch_unsub: Callable[[], None] | None = None
        self._refresh_unsub: Callable[[], None] | None = None

    @property
    def options(self) -> dict:
        return {**self.entry.data, **self.entry.options}

    async def async_load(self) -> None:
        if stored := await self._store.async_load():
            self.data.update(stored)

    def _inventory(self) -> dict:
        """Registries plus what the user decided about kinds."""
        inv = build_inventory(self.hass)
        for entity_id, kind in self.data.get("kind_override", {}).items():
            if entity_id in inv["entities"]:
                inv["entities"][entity_id]["kind_override"] = kind
        return inv

    def _save(self) -> None:
        self._store.async_delay_save(lambda: self.data, 1)

    def _changed(self) -> None:
        """Map, notes or registries changed: save and refresh the description sensor."""
        self._save()
        async_dispatcher_send(self.hass, SIGNAL_CHANGED)

    @callback
    def async_shutdown(self) -> None:
        for unsub in (self._watch_unsub, self._refresh_unsub):
            if unsub:
                unsub()
        self._watch_unsub = self._refresh_unsub = None

    @callback
    def schedule_refresh(self) -> None:
        """Registries changed: refresh the description once things settle."""
        if self._refresh_unsub:
            return

        @callback
        def _run(_now: Any) -> None:
            self._refresh_unsub = None
            async_dispatcher_send(self.hass, SIGNAL_CHANGED)

        self._refresh_unsub = async_call_later(self.hass, 5, _run)

    @callback
    def schedule_rules_scan(self, delay: float) -> None:
        """Rules-only scan a little later; repeated calls push it back."""
        if self._watch_unsub:
            self._watch_unsub()

        @callback
        def _run(_now: Any) -> None:
            self._watch_unsub = None
            self.start_scan(False)

        self._watch_unsub = async_call_later(self.hass, delay, _run)

    # --- scanning -------------------------------------------------------

    def start_scan(self, use_llm: bool) -> bool:
        if self._scan_task and not self._scan_task.done():
            return False
        self.progress = {"running": True, "phase": "rules", "done": 0, "total": 0, "error": None}
        self._scan_task = self.entry.async_create_background_task(
            self.hass, self._scan(use_llm), "hauskarte_scan"
        )
        return True

    async def async_scan(self, use_llm: bool) -> None:
        """Scan and wait for the result (used by the service and tests)."""
        if not self.start_scan(use_llm):
            raise HomeAssistantError("A scan is already running")
        assert self._scan_task is not None
        await self._scan_task

    async def _scan(self, use_llm: bool) -> None:
        try:
            inv = self._inventory()
            self.data["proposals"] = self._merge_with_decisions(rules.build_proposals(inv))
            self.data["last_scan"] = dt_util.utcnow().isoformat()
            self._save()
            self.progress["phase"] = "duplicates"
            await self._find_duplicates(inv)
            self._save()
            if use_llm and llm.configured(self.options):
                await self._ask_llm(inv)
        except Exception as err:
            _LOGGER.exception("Hauskarte scan failed")
            self.progress["error"] = str(err)
        finally:
            self.progress["running"] = False
            self.progress["phase"] = None
            self._update_issue()
            self._save()

    # --- repairs ----------------------------------------------------------

    def _open_ids(self) -> set[str]:
        return {pid for pid, p in self.data["proposals"].items() if p["status"] == STATUS_OPEN}

    @callback
    def _update_issue(self) -> None:
        """One repairs entry while there are open proposals nobody has looked at yet."""
        open_ids = self._open_ids()
        new = open_ids - set(self.data["seen"])
        if not open_ids:
            ir.async_delete_issue(self.hass, DOMAIN, ISSUE_NEW)
        elif new:
            safe = sum(1 for pid in new if self.data["proposals"][pid]["safe"])
            ir.async_create_issue(
                self.hass,
                DOMAIN,
                ISSUE_NEW,
                is_fixable=True,
                severity=ir.IssueSeverity.WARNING,
                translation_key=ISSUE_NEW,
                translation_placeholders={"count": str(len(new)), "safe": str(safe)},
            )

    @callback
    def mark_seen(self) -> None:
        """The user looked at the panel: nothing is new any more."""
        open_ids = self._open_ids()
        if set(self.data["seen"]) != open_ids:
            self.data["seen"] = sorted(open_ids)
            self._save()
        ir.async_delete_issue(self.hass, DOMAIN, ISSUE_NEW)

    def _merge_with_decisions(self, fresh: dict[str, dict]) -> dict[str, dict]:
        result = {}
        irrelevant = self.data.get("irrelevant", {})
        for pid, prop in fresh.items():
            if pid.startswith("device:") and pid[7:] in irrelevant:
                continue  # marked as not relevant: nothing to tidy up there
            decision = self.data["decisions"].get(pid)
            same = decision is not None and decision["fingerprint"] == prop["fingerprint"]
            if same and decision["status"] in (STATUS_DONE, STATUS_IGNORED):
                continue
            old = self.data["proposals"].get(pid)
            if old and old["fingerprint"] == prop["fingerprint"] and old["source"] == "llm":
                prop = old  # nothing changed since the model looked at it
            prop["status"] = STATUS_LATER if same and decision["status"] == STATUS_LATER else STATUS_OPEN
            result[pid] = prop
        # Decisions about units that no longer differ are kept; they are small.
        return result

    async def _ask_llm(self, inv: dict) -> None:
        todo = [
            p
            for p in self.data["proposals"].values()
            if p["status"] == STATUS_OPEN and p["source"] != "llm" and rules.needs_llm(p)
        ]
        size = max(1, int(self.options.get(CONF_BATCH_SIZE, DEFAULT_BATCH_SIZE)))
        self.progress.update(phase="llm", done=0, total=len(todo))
        # One batch at a time: the model server is shared with the voice assistant.
        for start in range(0, len(todo), size):
            batch = todo[start : start + size]
            try:
                answers = await llm.suggest(self.hass, self.options, inv, batch)
            except llm.LLMError as err:
                _LOGGER.warning("Hauskarte: language model failed: %s", err)
                self.progress["error"] = str(err)
                return
            for prop in batch:
                if (answer := answers.get(prop["id"])) and prop["id"] in self.data["proposals"]:
                    merged = rules.merge_llm(prop, answer, inv)
                    merged["status"] = prop["status"]
                    self.data["proposals"][prop["id"]] = merged
            self.progress["done"] += len(batch)
            self._save()

    # --- decisions ------------------------------------------------------

    def decide(self, pid: str, status: str) -> None:
        prop = self.data["proposals"].get(pid)
        if status == STATUS_OPEN:
            # "show again": forget the decision, the next scan brings it back
            self.data["decisions"].pop(pid, None)
            if prop:
                prop["status"] = STATUS_OPEN
            self._save()
            return
        if prop is None:
            raise HomeAssistantError(f"Unknown proposal {pid}")
        self.data["decisions"][pid] = {
            "status": status,
            "fingerprint": prop["fingerprint"],
            "title": prop["title"],
            "at": dt_util.utcnow().isoformat(),
        }
        if status == STATUS_IGNORED:
            del self.data["proposals"][pid]
        else:
            prop["status"] = status
        self._save()

    # --- writing --------------------------------------------------------

    def apply(self, pid: str, values: dict) -> dict:
        """Write the chosen values for one proposal. Returns a summary."""
        prop = self.data["proposals"].get(pid)
        if prop is None:
            raise HomeAssistantError(f"Unknown proposal {pid}")
        kind, _, key = pid.partition(":")
        dev_reg = dr.async_get(self.hass)
        ent_reg = er.async_get(self.hass)
        area_reg = ar.async_get(self.hass)
        records: list[dict] = []

        def record(kind_: str, target: str, old: Any, new: Any) -> None:
            records.append({"type": kind_, "target": target, "old": old, "new": new})

        area_id = values.get("area_id", prop["current"]["area_id"]) or None
        if area_id and area_reg.async_get_area(area_id) is None:
            raise HomeAssistantError(f"Unknown area {area_id}")
        name = values.get("name", prop["current"]["name"])
        name = (name or "").strip()[:100] or None

        if kind == "device":
            dev = dev_reg.async_get(key)
            if dev is None:
                raise HomeAssistantError("Device no longer exists")
            if area_id != dev.area_id:
                record("device_area", key, dev.area_id, area_id)
                dev_reg.async_update_device(key, area_id=area_id)
            if name != dev.name_by_user:
                record("device_name", key, dev.name_by_user, name)
                dev_reg.async_update_device(key, name_by_user=name)
        else:
            ent = ent_reg.async_get(key)
            if ent is None:
                raise HomeAssistantError("Entity no longer exists")
            if area_id != ent.area_id:
                record("entity_area", key, ent.area_id, area_id)
                ent_reg.async_update_entity(key, area_id=area_id)
            if name != ent.name:
                record("entity_name", key, ent.name, name)
                ent_reg.async_update_entity(key, name=name)

        allowed = {r["entity_id"] for r in prop["entities"]}
        for entity_id, wanted in (values.get("entities") or {}).items():
            if entity_id not in allowed or (ent := ent_reg.async_get(entity_id)) is None:
                continue
            if wanted.get("remove"):
                record("entity_removed", entity_id, None, None)
                ent_reg.async_remove(entity_id)
                continue
            if "exposed" in wanted:
                old = async_should_expose(self.hass, ASSISTANT, entity_id)
                if bool(wanted["exposed"]) != old:
                    record("entity_exposed", entity_id, old, bool(wanted["exposed"]))
                    async_expose_entity(self.hass, ASSISTANT, entity_id, bool(wanted["exposed"]))
            if isinstance(wanted.get("aliases"), list):
                clean: list[str] = []
                for alias in wanted["aliases"]:
                    if isinstance(alias, str) and (alias := alias.strip()[:60]) and alias not in clean:
                        clean.append(alias)
                if clean != alias_strings(ent.aliases):
                    record("entity_aliases", entity_id, serialize_aliases(ent.aliases), clean)
                    ent_reg.async_update_entity(entity_id, aliases=build_aliases(ent.aliases, clean))

        if "on_map" in values:
            key = description.map_id(prop)
            old = self.data["shown"].get(key)
            if old != bool(values["on_map"]):
                record("map_visible", key, old, bool(values["on_map"]))
                self.data["shown"][key] = bool(values["on_map"])

        batch = self._push_undo(pid, prop["title"], records)

        inv = self._inventory()
        self.data["decisions"][pid] = {
            "status": STATUS_DONE,
            "fingerprint": rules.fingerprint(inv, pid),
            "title": prop["title"],
            "at": dt_util.utcnow().isoformat(),
        }
        del self.data["proposals"][pid]
        self._save()
        return {"changes": len(records), "batch": batch}

    def _push_undo(self, unit: str | None, title: str, records: list[dict]) -> str | None:
        if not records:
            return None
        batch = uuid.uuid4().hex[:10]
        self.data["undo"].append(
            {
                "batch": batch,
                "unit": unit,
                "title": title,
                "at": dt_util.utcnow().isoformat(),
                "records": records,
            }
        )
        del self.data["undo"][:-UNDO_LIMIT]
        return batch

    def apply_safe(self, ids: list[str] | None = None) -> dict:
        """Accept every safe proposal (or the given ones) as proposed."""
        done = changes = 0
        for pid in list(ids or self.data["proposals"]):
            prop = self.data["proposals"].get(pid)
            if prop is None or not prop["safe"] or prop["status"] != STATUS_OPEN:
                continue
            changes += self.apply(pid, values_from_proposal(prop))["changes"]
            done += 1
        return {"proposals": done, "changes": changes}

    def undo(self) -> dict:
        """Revert the most recent batch of changes."""
        if not self.data["undo"]:
            return {"reverted": 0, "skipped": 0}
        batch = self.data["undo"].pop()
        reverted, skipped = self._revert(batch["records"])
        if batch["unit"]:
            self.data["decisions"].pop(batch["unit"], None)
        self._changed()
        return {"reverted": reverted, "skipped": skipped, "title": batch["title"]}

    def _revert(self, records: list[dict]) -> tuple[int, int]:
        """Put back what the records changed, newest first."""
        dev_reg = dr.async_get(self.hass)
        ent_reg = er.async_get(self.hass)
        area_reg = ar.async_get(self.hass)
        floor_reg = fr.async_get(self.hass)
        reverted = skipped = 0
        for rec in reversed(records):
            target, old = rec["target"], rec["old"]
            kind = rec["type"]
            if kind in (
                "layout",
                "pin",
                "map_visible",
                "dup_decision",
                "kind_override",
                "icon",
                "irrelevant",
            ):
                store = {
                    "irrelevant": "irrelevant",
                    "layout": "layout",
                    "pin": "pins",
                    "map_visible": "shown",
                    "dup_decision": "dup_decisions",
                    "kind_override": "kind_override",
                    "icon": "icons",
                }[kind]
                self.data.setdefault(store, {})
                if old is None:
                    self.data[store].pop(target, None)
                else:
                    self.data[store][target] = old
                if kind == "dup_decision":
                    self.data["merged"].pop(target, None)
                reverted += 1
                continue
            if kind == "area_labels":
                if area_reg.async_get_area(target) is None:
                    skipped += 1
                    continue
                area_reg.async_update(target, labels=set(old))
                reverted += 1
                continue
            if kind in ("label_name", "group_created"):
                label_reg = lr.async_get(self.hass)
                if label_reg.async_get_label(target) is None:
                    skipped += 1
                    continue
                if kind == "label_name":
                    label_reg.async_update(target, name=old)
                else:
                    if target in self.data.get("groups", []):
                        self.data["groups"].remove(target)
                    if rec["new"]["created"]:
                        label_reg.async_delete(target)
                reverted += 1
                continue
            if kind == "group_deleted":
                label_reg = lr.async_get(self.hass)
                name = (
                    old["name"]
                    if not label_reg.async_get_label_by_name(old["name"])
                    else f"{old['name']} (2)"
                )
                label = label_reg.async_create(name, icon=old["icon"], description=old["description"])
                self.data.setdefault("groups", []).append(label.label_id)
                for area_id in old["areas"]:
                    area = area_reg.async_get_area(area_id)
                    if area is not None:
                        area_reg.async_update(area_id, labels=set(area.labels) | {label.label_id})
                reverted += 1
                continue
            if kind == "area_to_group":
                label_reg = lr.async_get(self.hass)
                name = (
                    old["name"] if not area_reg.async_get_area_by_name(old["name"]) else f"{old['name']} (2)"
                )
                back = area_reg.async_create(
                    name, floor_id=old["floor_id"], aliases=set(old["aliases"]), labels=set(old["labels"])
                )
                for device_id, moved_to in old["devices"].items():
                    dev = dev_reg.async_get(device_id)
                    if dev is not None and dev.area_id == moved_to:
                        dev_reg.async_update_device(device_id, area_id=back.id)
                for entity_id, moved_to in old["entities"].items():
                    ent = ent_reg.async_get(entity_id)
                    if ent is not None and ent.area_id == moved_to:
                        ent_reg.async_update_entity(entity_id, area_id=back.id)
                for member, labels in old["member_labels"].items():
                    if area_reg.async_get_area(member) is not None:
                        area_reg.async_update(member, labels=set(labels))
                if not old.get("label_was_group") and target in self.data.get("groups", []):
                    self.data["groups"].remove(target)
                if old.get("label_created") and label_reg.async_get_label(target) is not None:
                    label_reg.async_delete(target)
                if old["layout"] is not None:
                    self.data["layout"][back.id] = old["layout"]
                if old["note"]:
                    self.data["notes"][back.id] = old["note"]
                reverted += 1
                continue
            if kind == "area_merged":
                # bring the room back (new id) and move its things back to it
                name = old["name"]
                if area_reg.async_get_area_by_name(name):
                    name = f"{name} (2)"
                back = area_reg.async_create(name, floor_id=old["floor_id"], aliases=set(old["aliases"]))
                for device_id in old["devices"]:
                    dev = dev_reg.async_get(device_id)
                    if dev is not None and dev.area_id == target:
                        dev_reg.async_update_device(device_id, area_id=back.id)
                for entity_id in old["entities"]:
                    ent = ent_reg.async_get(entity_id)
                    if ent is not None and ent.area_id == target:
                        ent_reg.async_update_entity(entity_id, area_id=back.id)
                if area_reg.async_get_area(target) is not None:
                    area_reg.async_update(target, aliases=set(old["target_aliases"]))
                for store, mine, theirs in (
                    ("layout", "target_layout", "layout"),
                    ("notes", "target_note", "note"),
                ):
                    if old[mine] is None:
                        self.data[store].pop(target, None)
                    else:
                        self.data[store][target] = old[mine]
                    if old[theirs] is not None:
                        self.data[store][back.id] = old[theirs]
                reverted += 1
                continue
            if kind in ("area_floor", "area_created", "area_name"):
                if area_reg.async_get_area(target) is None:
                    skipped += 1
                    continue
                if kind == "area_floor":
                    area_reg.async_update(target, floor_id=old)
                elif kind == "area_name":
                    area_reg.async_update(target, name=old)
                else:
                    area_reg.async_delete(target)
                    self.data["layout"].pop(target, None)
                reverted += 1
                continue
            if kind in ("floor_created", "floor_update"):
                if floor_reg.async_get_floor(target) is None:
                    skipped += 1
                    continue
                if kind == "floor_update":
                    floor_reg.async_update(target, name=old["name"], level=old["level"])
                else:
                    floor_reg.async_delete(target)
                    self.data["plans"].pop(target, None)
                reverted += 1
                continue
            if kind.startswith("device_") and dev_reg.async_get(target) is None:
                skipped += 1
                continue
            if kind.startswith("entity_") and kind != "entity_exposed" and ent_reg.async_get(target) is None:
                skipped += 1
                continue
            if kind == "device_disabled":
                dev_reg.async_update_device(target, disabled_by=dr.DeviceEntryDisabler(old) if old else None)
            elif kind == "device_area":
                dev_reg.async_update_device(target, area_id=old)
            elif kind == "device_name":
                dev_reg.async_update_device(target, name_by_user=old)
            elif kind == "entity_area":
                ent_reg.async_update_entity(target, area_id=old)
            elif kind == "entity_name":
                ent_reg.async_update_entity(target, name=old)
            elif kind == "entity_exposed":
                async_expose_entity(self.hass, ASSISTANT, target, bool(old))
            elif kind == "entity_hidden":
                ent_reg.async_update_entity(target, hidden_by=er.RegistryEntryHider(old) if old else None)
            elif kind == "entity_aliases":
                ent = ent_reg.async_get(target)
                ent_reg.async_update_entity(target, aliases=deserialize_aliases(ent.aliases, old))
            else:  # entity_removed cannot be brought back
                skipped += 1
                continue
            reverted += 1
        return reverted, skipped

    # --- duplicates -----------------------------------------------------

    async def _history_transitions(self, entity_ids: list[str], days: int = 7) -> dict[str, list[float]]:
        """State change moments per entity from the recorder; empty if there is none."""
        if not entity_ids or "recorder" not in self.hass.config.components:
            return {}
        try:
            from homeassistant.components.recorder import history

            try:
                from homeassistant.helpers.recorder import get_instance
            except ImportError:  # before 2025
                from homeassistant.components.recorder import get_instance
        except ImportError:
            return {}
        start = dt_util.utcnow() - timedelta(days=days)

        def fetch() -> dict:
            return history.get_significant_states(
                self.hass,
                start,
                None,
                entity_ids,
                None,
                include_start_time_state=False,
                significant_changes_only=False,
                minimal_response=False,
                no_attributes=True,
            )

        try:
            states = await get_instance(self.hass).async_add_executor_job(fetch)
        except Exception:
            _LOGGER.warning("Hauskarte: history not readable, duplicates by name only", exc_info=True)
            return {}
        result = {}
        for entity_id, items in states.items():
            rows = []
            for item in items:
                if isinstance(item, dict):
                    state, when = item.get("state"), item.get("last_changed")
                    when = dt_util.parse_datetime(when) if isinstance(when, str) else when
                else:
                    state, when = item.state, item.last_changed
                if when is not None:
                    rows.append((when.timestamp(), state))
            result[entity_id] = duplicates.transitions(sorted(rows))
        return result

    async def _find_duplicates(self, inv: dict) -> None:
        merged_away = {o for m in self.data["merged"].values() for o in m["others"]}
        cand = duplicates.candidates(inv, merged_away)
        pairs = duplicates.name_pairs(inv, cand)
        times = await self._history_transitions(list(cand))
        pairs += duplicates.history_pairs(times, cand)
        self.data["duplicates"] = duplicates.build_groups(cand, pairs)
        self.data["history_checked"] = bool(times)

    def _group(self, key: str) -> dict:
        group = next((g for g in self.data["duplicates"] if g["key"] == key), None)
        if group is None:
            raise HomeAssistantError("Unknown duplicate group")
        return group

    def merge(self, key: str, primary: str, area_id: str | None = None) -> dict:
        """One entity for the assistant; the others hidden and not exposed. Integrations untouched."""
        group = self._group(key)
        ids = [m["entity_id"] for m in group["members"]]
        if primary not in ids:
            raise HomeAssistantError("Primary is not in the group")
        ent_reg = er.async_get(self.hass)
        main = ent_reg.async_get(primary)
        if main is None:
            raise HomeAssistantError("Entity no longer exists")
        records: list[dict] = []
        if not async_should_expose(self.hass, ASSISTANT, primary):
            records.append({"type": "entity_exposed", "target": primary, "old": False, "new": True})
            async_expose_entity(self.hass, ASSISTANT, primary, True)
        member_area = next((m["area_id"] for m in group["members"] if m["area_id"]), None)
        primary_area = next(m["area_id"] for m in group["members"] if m["entity_id"] == primary)
        if area_id and ar.async_get(self.hass).async_get_area(area_id) is None:
            raise HomeAssistantError("Unknown area")
        wanted_area = area_id or (member_area if primary_area is None else None)
        if wanted_area and wanted_area != primary_area:
            # the room belongs to the device of the main entity when it has one
            dev_reg = dr.async_get(self.hass)
            dev = dev_reg.async_get(main.device_id) if main.device_id else None
            if dev is not None and main.area_id is None:
                records.append(
                    {"type": "device_area", "target": dev.id, "old": dev.area_id, "new": wanted_area}
                )
                dev_reg.async_update_device(dev.id, area_id=wanted_area)
            else:
                records.append(
                    {"type": "entity_area", "target": primary, "old": main.area_id, "new": wanted_area}
                )
                ent_reg.async_update_entity(primary, area_id=wanted_area)
        # The other names become aliases, so whatever people called it still works.
        aliases = alias_strings(main.aliases)
        for m in group["members"]:
            if m["entity_id"] != primary and not looks_technical(m["title"]) and m["title"] not in aliases:
                aliases.append(m["title"])
        if aliases != alias_strings(main.aliases):
            records.append(
                {
                    "type": "entity_aliases",
                    "target": primary,
                    "old": serialize_aliases(main.aliases),
                    "new": aliases,
                }
            )
            ent_reg.async_update_entity(primary, aliases=build_aliases(main.aliases, aliases))
        others = [i for i in ids if i != primary]
        for other in others:
            ent = ent_reg.async_get(other)
            if ent is None:
                continue
            if async_should_expose(self.hass, ASSISTANT, other):
                records.append({"type": "entity_exposed", "target": other, "old": True, "new": False})
                async_expose_entity(self.hass, ASSISTANT, other, False)
            if ent.hidden_by is None:
                records.append({"type": "entity_hidden", "target": other, "old": None, "new": "user"})
                ent_reg.async_update_entity(other, hidden_by=er.RegistryEntryHider.USER)
        records.append(
            {
                "type": "dup_decision",
                "target": key,
                "old": self.data["dup_decisions"].get(key),
                "new": "merged",
            }
        )
        self.data["dup_decisions"][key] = "merged"
        title = next(m["title"] for m in group["members"] if m["entity_id"] == primary)
        self.data["merged"][key] = {
            "primary": primary,
            "others": others,
            "title": title,
            "members": group["members"],
            "records": [r for r in records if r["type"] != "dup_decision"],
            "at": dt_util.utcnow().isoformat(),
        }
        self._push_undo(None, title, records)
        self._changed()
        return {"changes": len(records) - 1}

    def unmerge(self, key: str) -> dict:
        merged = self.data["merged"].get(key)
        if merged is None:
            raise HomeAssistantError("Not merged")
        reverted, skipped = self._revert(merged["records"])
        self.data["merged"].pop(key, None)
        self.data["dup_decisions"].pop(key, None)
        self._changed()
        return {"reverted": reverted, "skipped": skipped}

    def not_duplicate(self, key: str) -> None:
        self._group(key)
        old = self.data["dup_decisions"].get(key)
        self.data["dup_decisions"][key] = "different"
        self._push_undo(None, key, [{"type": "dup_decision", "target": key, "old": old, "new": "different"}])
        self._changed()

    # --- AI review ----------------------------------------------------------

    def start_ai_review(self, only: list[str] | None = None) -> bool:
        if not llm.configured(self.options):
            raise HomeAssistantError("No language model configured")
        if self._scan_task and not self._scan_task.done():
            return False
        total = len(only) if only else 5
        self.progress = {
            "running": True,
            "phase": "ai",
            "task": None,
            "done": 0,
            "total": total,
            "error": None,
        }
        self._scan_task = self.entry.async_create_background_task(
            self.hass, self._ai_review(only), "hauskarte_ai_review"
        )
        return True

    async def async_ai_review(self, only: list[str] | None = None) -> None:
        if not self.start_ai_review(only):
            raise HomeAssistantError("A scan is already running")
        assert self._scan_task is not None
        await self._scan_task

    async def _ai_review(self, only: list[str] | None = None) -> None:
        """Ask the model about each cleanup step, one question after the other."""
        inv = self._inventory()
        snap = self.snapshot()
        language = self.hass.config.language
        area_names = {a["area_id"]: a["name"] for a in snap["areas"]}
        # a partial review (e.g. only rooms → floors) keeps the other answers
        result: dict[str, Any] = dict(self.data.get("ai") or {}) if only else {}
        result["at"] = dt_util.utcnow().isoformat()
        result["errors"] = {k: v for k, v in (result.get("errors") or {}).items() if only and k not in only}
        room_devices: dict[str, list[str]] = {}
        for dev in inv["devices"].values():
            if dev.get("area_id") and dev["entity_ids"]:
                room_devices.setdefault(dev["area_id"], []).append(
                    f"{kinds.device_kind(inv, dev)}: {dev.get('name') or dev.get('model') or '?'}"
                )
        silent = [
            {**d, "integration": g["integration"]}
            for g in snap["devices"]
            for d in g["devices"]
            if d["silent"]
        ]
        switches = [
            {
                "entity_id": e["entity_id"],
                "name": e.get("title"),
                "device": (inv["devices"].get(e.get("device_id") or "") or {}).get("name"),
                "model": (inv["devices"].get(e.get("device_id") or "") or {}).get("model"),
                "integration": e.get("platform"),
                "room": area_names.get(duplicates.effective_area(inv, e) or ""),
            }
            for e in inv["entities"].values()
            if e["domain"] == "switch"
            and not e.get("entity_category")
            and not e.get("restored")
            and kinds.entity_kind(e, (inv["devices"].get(e.get("device_id") or "") or {}).get("name"))
            == "switch"
        ][:80]
        tasks = [
            (
                "floors",
                review.floors_task(inv, room_devices, language),
                lambda d: review.parse_floors(d, inv),
            ),
            (
                "duplicates",
                review.duplicates_task(snap["duplicates"], area_names) if snap["duplicates"] else None,
                lambda d: review.parse_duplicates(d, snap["duplicates"]),
            ),
            (
                "orphans",
                review.orphans_task(snap["orphans"]) if snap["orphans"] else None,
                lambda d: review.parse_orphans(d, snap["orphans"]),
            ),
            (
                "silent",
                review.silent_task(silent) if silent else None,
                lambda d: review.parse_silent(d, silent),
            ),
            (
                "switches",
                review.switches_task(switches) if switches else None,
                lambda d: review.parse_switches(d, switches),
            ),
        ]
        try:
            for name, prompt, parse in tasks:
                if only and name not in only:
                    continue
                self.progress["task"] = name
                if prompt is not None:
                    try:
                        answer = await llm.ask_json(self.hass, self.options, review.system(language), prompt)
                        result[name] = parse(answer)
                    except llm.LLMError as err:
                        _LOGGER.warning("Hauskarte AI review %s failed: %s", name, err)
                        result["errors"][name] = str(err)
                self.progress["done"] += 1
            self.data["ai"] = result
        except Exception as err:
            _LOGGER.exception("Hauskarte AI review failed")
            self.progress["error"] = str(err)
        finally:
            self.progress.update(running=False, phase=None, task=None)
            if result["errors"]:
                self.progress["error"] = "; ".join(f"{k}: {v}" for k, v in result["errors"].items())
            self._changed()

    def apply_floor_plan(self, floors: list[dict], rooms: list[dict]) -> dict:
        """Floor names/levels and room → floor in one undo step (e.g. from the AI review)."""
        floor_reg = fr.async_get(self.hass)
        area_reg = ar.async_get(self.hass)
        records: list[dict] = []
        for f in floors:
            floor = floor_reg.async_get_floor(f["floor_id"])
            if floor is None:
                continue
            changes: dict[str, Any] = {}
            if f.get("name") and f["name"].strip() and f["name"].strip() != floor.name:
                changes["name"] = f["name"].strip()[:60]
            if "level" in f and f["level"] != floor.level:
                changes["level"] = f["level"]
            if changes:
                records.append(
                    {
                        "type": "floor_update",
                        "target": floor.floor_id,
                        "old": {"name": floor.name, "level": floor.level},
                        "new": changes,
                    }
                )
                floor_reg.async_update(floor.floor_id, **changes)
        for r in rooms:
            area = area_reg.async_get_area(r["area_id"])
            if area is None or (r["floor_id"] and floor_reg.async_get_floor(r["floor_id"]) is None):
                continue
            if area.floor_id != r["floor_id"]:
                records.append(
                    {"type": "area_floor", "target": area.id, "old": area.floor_id, "new": r["floor_id"]}
                )
                area_reg.async_update(area.id, floor_id=r["floor_id"])
        self._push_undo(None, "Etagen", records)
        self._changed()
        return {"changes": len(records)}

    def set_kind_override(self, entity_id: str, kind: str | None) -> None:
        old = self.data["kind_override"].get(entity_id)
        if kind:
            self.data["kind_override"][entity_id] = kind
        else:
            self.data["kind_override"].pop(entity_id, None)
        self._push_undo(
            None, entity_id, [{"type": "kind_override", "target": entity_id, "old": old, "new": kind}]
        )
        self._changed()

    def _ai_view(self, inv: dict) -> dict:
        """The stored AI review, minus what has been done meanwhile."""
        ai = self.data.get("ai") or {}
        if not ai:
            return {}
        floors_now = inv["floors"]
        floors = [
            f
            for f in (ai.get("floors") or {}).get("floors", [])
            if f["floor_id"] in floors_now
            and (
                floors_now[f["floor_id"]]["name"] != f["name"]
                or floors_now[f["floor_id"]].get("level") != f["level"]
            )
        ]
        rooms = [
            r
            for r in (ai.get("floors") or {}).get("rooms", [])
            if r["area_id"] in inv["areas"]
            and r["floor_id"] in floors_now
            and inv["areas"][r["area_id"]].get("floor_id") != r["floor_id"]
        ]
        return {"at": ai.get("at"), "errors": ai.get("errors", {}), "floors": floors, "rooms": rooms}

    # --- floors and rooms -------------------------------------------------

    def update_floor(self, floor_id: str, name: str | None, level: int | None, set_level: bool) -> None:
        floor_reg = fr.async_get(self.hass)
        floor = floor_reg.async_get_floor(floor_id)
        if floor is None:
            raise HomeAssistantError("Unknown floor")
        changes: dict[str, Any] = {}
        if name is not None and name.strip() and name.strip() != floor.name:
            changes["name"] = name.strip()[:60]
        if set_level and level != floor.level:
            changes["level"] = level
        if not changes:
            return
        old = {"name": floor.name, "level": floor.level}
        floor_reg.async_update(floor_id, **changes)
        self._push_undo(
            None, floor.name, [{"type": "floor_update", "target": floor_id, "old": old, "new": changes}]
        )
        self._changed()

    def update_area(self, area_id: str, name: str | None, floor_id: str | None, set_floor: bool) -> None:
        area_reg = ar.async_get(self.hass)
        area = area_reg.async_get_area(area_id)
        if area is None:
            raise HomeAssistantError("Unknown area")
        records = []
        if name is not None and name.strip() and name.strip() != area.name:
            try:
                area_reg.async_update(area_id, name=name.strip()[:60])
            except ValueError as err:  # Home Assistant allows every room name only once
                raise HomeAssistantError(f"Name already in use: {name.strip()}") from err
            records.append({"type": "area_name", "target": area_id, "old": area.name, "new": name.strip()})
        if set_floor and floor_id != area.floor_id:
            if floor_id and fr.async_get(self.hass).async_get_floor(floor_id) is None:
                raise HomeAssistantError("Unknown floor")
            records.append({"type": "area_floor", "target": area_id, "old": area.floor_id, "new": floor_id})
            area_reg.async_update(area_id, floor_id=floor_id)
        if records:
            self._push_undo(None, area.name, records)
            self._changed()

    def create_area(self, name: str, floor_id: str | None) -> str:
        name = (name or "").strip()[:60]
        if not name:
            raise HomeAssistantError("A room needs a name")
        area_reg = ar.async_get(self.hass)
        if area_reg.async_get_area_by_name(name):
            raise HomeAssistantError(f"Name already in use: {name}")
        area = area_reg.async_create(name, floor_id=floor_id)
        self._push_undo(None, name, [{"type": "area_created", "target": area.id, "old": None, "new": name}])
        self._changed()
        return area.id

    def set_wizard(self, changes: dict) -> dict:
        """Where the user is in the start assistant; survives restarts and other devices."""
        wizard = self.data.setdefault(
            "wizard", {"pos": None, "done": [], "finished": False, "dismissed": False}
        )
        if changes.get("reset"):
            wizard.update(pos=None, done=[], finished=False, dismissed=False)
        if "pos" in changes:
            wizard["pos"] = changes["pos"]
        if changes.get("done") and changes["done"] not in wizard["done"]:
            wizard["done"].append(changes["done"])
        for key in ("finished", "dismissed"):
            if key in changes:
                wizard[key] = bool(changes[key])
        self._save()
        return wizard

    def set_device_areas(self, items: list[dict]) -> dict:
        """Several devices to their rooms in one undo step."""
        dev_reg = dr.async_get(self.hass)
        area_reg = ar.async_get(self.hass)
        records = []
        for item in items:
            dev = dev_reg.async_get(item["device_id"])
            area_id = item.get("area_id") or None
            if (
                dev is None
                or dev.area_id == area_id
                or (area_id and area_reg.async_get_area(area_id) is None)
            ):
                continue
            records.append({"type": "device_area", "target": dev.id, "old": dev.area_id, "new": area_id})
            dev_reg.async_update_device(dev.id, area_id=area_id)
            self._refresh_unit(f"device:{dev.id}")
        self._push_undo(None, f"{len(records)} Geräte", records)
        self._changed()
        return {"changes": len(records)}

    def area_references(self, area_id: str) -> dict:
        """Automations and scripts that name this room directly (devices keep their ids when rooms merge)."""
        found: dict[str, list[dict]] = {"automations": [], "scripts": []}
        for key, domain, func in (
            ("automations", "automation", "automations_with_area"),
            ("scripts", "script", "scripts_with_area"),
        ):
            if domain not in self.hass.config.components:
                continue
            try:
                module = __import__(f"homeassistant.components.{domain}", fromlist=[func])
                entity_ids = getattr(module, func)(self.hass, area_id)
            except (ImportError, AttributeError, KeyError):
                continue
            for entity_id in entity_ids:
                state = self.hass.states.get(entity_id)
                found[key].append({"entity_id": entity_id, "name": state.name if state else entity_id})
        return found

    def merge_areas(self, source_id: str, target_id: str) -> dict:
        """Move everything of one room into another; the old name stays as an alias. Undoable."""
        if source_id == target_id:
            raise HomeAssistantError("Choose two different rooms")
        area_reg = ar.async_get(self.hass)
        src = area_reg.async_get_area(source_id)
        dst = area_reg.async_get_area(target_id)
        if src is None or dst is None:
            raise HomeAssistantError("Unknown area")
        dev_reg = dr.async_get(self.hass)
        ent_reg = er.async_get(self.hass)
        moved_devices = [d.id for d in device_entries(dev_reg) if d.area_id == source_id]
        moved_entities = [e.entity_id for e in ent_reg.entities.values() if e.area_id == source_id]
        for device_id in moved_devices:
            dev_reg.async_update_device(device_id, area_id=target_id)
        for entity_id in moved_entities:
            ent_reg.async_update_entity(entity_id, area_id=target_id)
        aliases = set(dst.aliases) | set(src.aliases) | {src.name}
        aliases.discard(dst.name)
        old = {
            "name": src.name,
            "floor_id": src.floor_id,
            "aliases": sorted(src.aliases),
            "devices": moved_devices,
            "entities": moved_entities,
            "layout": self.data["layout"].get(source_id),
            "note": self.data["notes"].get(source_id),
            "target_aliases": sorted(dst.aliases),
            "target_layout": self.data["layout"].get(target_id),
            "target_note": self.data["notes"].get(target_id),
        }
        area_reg.async_update(target_id, aliases=aliases)
        if source_id in self.data["layout"]:
            self.data["layout"].setdefault(target_id, self.data["layout"][source_id])
            del self.data["layout"][source_id]
        if note := self.data["notes"].pop(source_id, None):
            mine = self.data["notes"].get(target_id)
            self.data["notes"][target_id] = f"{mine} · {note}" if mine else note
        area_reg.async_delete(source_id)
        self._push_undo(
            None,
            f"{src.name} → {dst.name}",
            [{"type": "area_merged", "target": target_id, "old": old, "new": None}],
        )
        self._changed()
        return {"devices": len(moved_devices), "entities": len(moved_entities)}

    # --- room groups (open spaces: "Wohnbereich" = Wohnzimmer + Esszimmer) -------------------------
    # A room group is a Home Assistant label on the member rooms, so automations can target it too.

    GROUP_DESCRIPTION = "Raumgruppe (Hauskarte)"

    def groups(self) -> list[dict]:
        label_reg = lr.async_get(self.hass)
        areas = list(ar.async_get(self.hass).async_list_areas())
        result = []
        for label_id in self.data.setdefault("groups", []):
            label = label_reg.async_get_label(label_id)
            if label is None:
                continue
            members = sorted((a.id for a in areas if label_id in a.labels), key=lambda i: i)
            result.append({"label_id": label_id, "name": label.name, "area_ids": members})
        return result

    def _set_area_labels(self, area_id: str, labels: set[str], records: list[dict]) -> None:
        area_reg = ar.async_get(self.hass)
        area = area_reg.async_get_area(area_id)
        if area is None or set(area.labels) == labels:
            return
        records.append(
            {"type": "area_labels", "target": area_id, "old": sorted(area.labels), "new": sorted(labels)}
        )
        area_reg.async_update(area_id, labels=labels)

    def _group_label(self, name: str, records: list[dict]) -> str:
        """The label for a group name: an existing one or a new one."""
        label_reg = lr.async_get(self.hass)
        label = label_reg.async_get_label_by_name(name)
        created = label is None
        if created:
            label = label_reg.async_create(name, icon="mdi:floor-plan", description=self.GROUP_DESCRIPTION)
        if label.label_id not in self.data["groups"]:
            self.data["groups"].append(label.label_id)
            records.append(
                {"type": "group_created", "target": label.label_id, "old": None, "new": {"created": created}}
            )
        return label.label_id

    def create_group(self, name: str, area_ids: list[str]) -> str:
        name = (name or "").strip()[:60]
        if not name:
            raise HomeAssistantError("A room group needs a name")
        area_reg = ar.async_get(self.hass)
        records: list[dict] = []
        label_id = self._group_label(name, records)
        for area_id in area_ids:
            area = area_reg.async_get_area(area_id)
            if area is not None:
                self._set_area_labels(area_id, set(area.labels) | {label_id}, records)
        self._push_undo(None, name, records)
        self._changed()
        return label_id

    def update_group(self, label_id: str, name: str | None, area_ids: list[str] | None) -> None:
        label_reg = lr.async_get(self.hass)
        label = label_reg.async_get_label(label_id)
        if label is None or label_id not in self.data.get("groups", []):
            raise HomeAssistantError("Unknown room group")
        records: list[dict] = []
        if name is not None and name.strip() and name.strip() != label.name:
            try:
                label_reg.async_update(label_id, name=name.strip()[:60])
            except ValueError as err:
                raise HomeAssistantError(f"Name already in use: {name.strip()}") from err
            records.append({"type": "label_name", "target": label_id, "old": label.name, "new": name.strip()})
        if area_ids is not None:
            for area in ar.async_get(self.hass).async_list_areas():
                labels = set(area.labels)
                labels = labels | {label_id} if area.id in area_ids else labels - {label_id}
                self._set_area_labels(area.id, labels, records)
        self._push_undo(None, label.name, records)
        self._changed()

    def delete_group(self, label_id: str) -> None:
        """Dissolve a group: the rooms stay, the label goes."""
        label_reg = lr.async_get(self.hass)
        label = label_reg.async_get_label(label_id)
        if label is None:
            raise HomeAssistantError("Unknown room group")
        members = [a.id for a in ar.async_get(self.hass).async_list_areas() if label_id in a.labels]
        old = {"name": label.name, "icon": label.icon, "description": label.description, "areas": members}
        for area_id in members:
            area = ar.async_get(self.hass).async_get_area(area_id)
            ar.async_get(self.hass).async_update(area_id, labels=set(area.labels) - {label_id})
        label_reg.async_delete(label_id)
        if label_id in self.data["groups"]:
            self.data["groups"].remove(label_id)
        self._push_undo(
            None, label.name, [{"type": "group_deleted", "target": label_id, "old": old, "new": None}]
        )
        self._changed()

    @staticmethod
    def _stem(name: str) -> str:
        """Wohnzimmer → wohn, Esszimmer → ess: what a device name in that room often starts with."""
        word = rules.normalize(name).replace(" ", "")
        for suffix in ("zimmer", "raum", "bereich", "kammer", "stube", "ecke", "room"):
            if word.endswith(suffix) and len(word) - len(suffix) >= 3:
                return word[: -len(suffix)]
        return word

    def convert_preview(self, area_id: str, member_ids: list[str]) -> dict:
        """What converting an area into a group would move, with a suggested room per device."""
        area_reg = ar.async_get(self.hass)
        if area_reg.async_get_area(area_id) is None:
            raise HomeAssistantError("Unknown area")
        members = [
            a for a in (area_reg.async_get_area(i) for i in member_ids) if a is not None and a.id != area_id
        ]
        inv = self._inventory()
        areas = {a.id: {"area_id": a.id, "name": a.name, "aliases": sorted(a.aliases)} for a in members}
        stems = {a.id: self._stem(a.name) for a in members}

        def suggest(*names: str | None) -> str | None:
            guess = rules.area_from_name(areas, *names) if areas else None
            if guess:
                return guess[0]
            words = " ".join(rules.normalize(n) for n in names if n).split()
            hits = [i for i, s in stems.items() if len(s) >= 3 and any(w.startswith(s) for w in words)]
            return hits[0] if len(hits) == 1 else None

        devices = [
            {
                "device_id": d["device_id"],
                "name": d.get("name") or d["device_id"],
                "what": kinds.device_kind(inv, d),
                "suggested": suggest(
                    d.get("name"), *(inv["entities"][e].get("title") for e in d["entity_ids"])
                ),
            }
            for d in inv["devices"].values()
            if d.get("area_id") == area_id
        ]
        entities = [
            {
                "entity_id": e["entity_id"],
                "name": e.get("title") or e["entity_id"],
                "what": kinds.entity_kind(e),
                "suggested": suggest(e.get("title")),
            }
            for e in inv["entities"].values()
            if e.get("area_id") == area_id
        ]
        return {"devices": devices, "entities": entities, "references": self.area_references(area_id)}

    def convert_area_to_group(
        self, area_id: str, member_ids: list[str], devices: dict[str, str], entities: dict[str, str]
    ) -> str:
        """Turn an area that is really several rooms into a room group: things move into the member rooms,
        the area is deleted and its name becomes the group label on the members. Undoable."""
        area_reg = ar.async_get(self.hass)
        area = area_reg.async_get_area(area_id)
        if area is None:
            raise HomeAssistantError("Unknown area")
        member_ids = [i for i in member_ids if i != area_id and area_reg.async_get_area(i) is not None]
        if not member_ids:
            raise HomeAssistantError("Choose at least one room for the group")
        dev_reg = dr.async_get(self.hass)
        ent_reg = er.async_get(self.hass)
        fallback = member_ids[0]
        moved_devices: dict[str, str] = {}
        for dev in device_entries(dev_reg):
            if dev.area_id == area_id:
                target = devices.get(dev.id) if devices.get(dev.id) in member_ids else fallback
                dev_reg.async_update_device(dev.id, area_id=target)
                moved_devices[dev.id] = target
        moved_entities: dict[str, str] = {}
        for ent in list(ent_reg.entities.values()):
            if ent.area_id == area_id:
                target = (
                    entities.get(ent.entity_id) if entities.get(ent.entity_id) in member_ids else fallback
                )
                ent_reg.async_update_entity(ent.entity_id, area_id=target)
                moved_entities[ent.entity_id] = target
        old = {
            "name": area.name,
            "floor_id": area.floor_id,
            "aliases": sorted(area.aliases),
            "labels": sorted(area.labels),
            "devices": moved_devices,
            "entities": moved_entities,
            "member_labels": {i: sorted(area_reg.async_get_area(i).labels) for i in member_ids},
            "layout": self.data["layout"].get(area_id),
            "note": self.data["notes"].get(area_id),
        }
        name = area.name
        area_reg.async_delete(area_id)  # first, so the group may take the same name in the label registry
        self.data["layout"].pop(area_id, None)
        self.data["notes"].pop(area_id, None)
        records: list[dict] = []
        label_id = self._group_label(name, records)
        old["label_created"] = any(r["type"] == "group_created" and r["new"]["created"] for r in records)
        old["label_was_group"] = not any(r["type"] == "group_created" for r in records)
        for member in member_ids:
            labels = set(area_reg.async_get_area(member).labels) | {label_id}
            area_reg.async_update(member, labels=labels)
        self._push_undo(
            None, name, [{"type": "area_to_group", "target": label_id, "old": old, "new": member_ids}]
        )
        self._changed()
        return label_id

    def set_device_area(self, device_id: str, area_id: str | None) -> None:
        dev_reg = dr.async_get(self.hass)
        dev = dev_reg.async_get(device_id)
        if dev is None:
            raise HomeAssistantError("Device no longer exists")
        if area_id and ar.async_get(self.hass).async_get_area(area_id) is None:
            raise HomeAssistantError("Unknown area")
        if dev.area_id == area_id:
            return
        records = [{"type": "device_area", "target": device_id, "old": dev.area_id, "new": area_id}]
        dev_reg.async_update_device(device_id, area_id=area_id)
        self._push_undo(None, dev.name_by_user or dev.name or device_id, records)
        self._refresh_unit(f"device:{device_id}")
        self._changed()

    def set_device_name(self, device_id: str, name: str | None) -> None:
        """Own name for a device (empty = back to the integration's name). Entities named after it follow."""
        dev_reg = dr.async_get(self.hass)
        dev = dev_reg.async_get(device_id)
        if dev is None:
            raise HomeAssistantError("Device no longer exists")
        name = (name or "").strip()[:100] or None
        if name == dev.name:
            name = None  # the same as the integration's name: no own name needed
        if dev.name_by_user == name:
            return
        records = [{"type": "device_name", "target": device_id, "old": dev.name_by_user, "new": name}]
        dev_reg.async_update_device(device_id, name_by_user=name)
        self._push_undo(None, name or dev.name or device_id, records)
        self._refresh_unit(f"device:{device_id}")
        self._changed()

    # --- map ------------------------------------------------------------

    @staticmethod
    def _floor_key(floor_id: str | None) -> str:
        return floor_id or ""

    def _rows(self, floor_id: str | None) -> int:
        plan = self.data["plans"].get(self._floor_key(floor_id)) or {}
        return int(plan.get("rows") or description.DEFAULT_ROWS)

    def _clamp(self, pos: dict, rows: int) -> dict:
        cols = description.GRID_COLUMNS
        try:
            x, y, w, h = (int(pos[k]) for k in "xywh")
        except (KeyError, TypeError, ValueError) as err:
            raise HomeAssistantError("Invalid position") from err
        x = min(max(x, 0), cols - 1)
        y = min(max(y, 0), rows - 1)
        return {"x": x, "y": y, "w": min(max(w, 1), cols - x), "h": min(max(h, 1), rows - y)}

    def set_position(self, area_id: str, pos: dict | None) -> None:
        area = ar.async_get(self.hass).async_get_area(area_id)
        if area is None:
            raise HomeAssistantError(f"Unknown area {area_id}")
        if pos is None:
            self.data["layout"].pop(area_id, None)
        else:
            self.data["layout"][area_id] = self._clamp(pos, self._rows(area.floor_id))
        self._changed()

    def set_note(self, key: str, text: str) -> None:
        if key != description.HOUSE_NOTE and ar.async_get(self.hass).async_get_area(key) is None:
            raise HomeAssistantError(f"Unknown area {key}")
        text = (text or "").strip()[:500]
        if text:
            self.data["notes"][key] = text
        else:
            self.data["notes"].pop(key, None)
        self._changed()

    def set_floor_plan(self, floor_id: str | None, image: str | None, rows: int | None) -> None:
        if floor_id and fr.async_get(self.hass).async_get_floor(floor_id) is None:
            raise HomeAssistantError(f"Unknown floor {floor_id}")
        plan = self.data["plans"].setdefault(self._floor_key(floor_id), {})
        if image is not None:
            if not image.startswith("data:image/") or len(image) > MAX_IMAGE_LENGTH:
                raise HomeAssistantError("Image must be a data URL below 2 MB")
            plan["image"] = image
            plan["version"] = hashlib.sha1(image.encode()).hexdigest()[:8]
        if rows is not None:
            plan["rows"] = min(max(int(rows), 4), 60)
        self._changed()

    def remove_floor_image(self, floor_id: str | None) -> None:
        plan = self.data["plans"].get(self._floor_key(floor_id)) or {}
        plan.pop("image", None)
        plan.pop("version", None)
        plan.pop("detected", None)
        self._changed()

    def floor_image(self, floor_id: str | None) -> str | None:
        return (self.data["plans"].get(self._floor_key(floor_id)) or {}).get("image")

    async def async_detect_plan(self, floor_id: str | None, gridded_image: str) -> list[dict]:
        """Let the vision model propose rooms; they wait on the map for review."""
        if not gridded_image.startswith("data:image/") or len(gridded_image) > MAX_IMAGE_LENGTH:
            raise HomeAssistantError("Image must be a data URL below 2 MB")
        inv = self._inventory()
        floor = inv["floors"].get(floor_id or "")
        try:
            rooms = await llm.detect_rooms(
                self.hass,
                self.options,
                inv,
                floor["name"] if floor else "",
                gridded_image,
                description.GRID_COLUMNS,
                self._rows(floor_id),
            )
        except llm.LLMError as err:
            raise HomeAssistantError(str(err)) from err
        self.data["plans"].setdefault(self._floor_key(floor_id), {})["detected"] = rooms
        self._changed()
        return rooms

    def discard_detected(self, floor_id: str | None) -> None:
        (self.data["plans"].get(self._floor_key(floor_id)) or {}).pop("detected", None)
        self._changed()

    def place_rooms(self, floor_id: str | None, rooms: list[dict], title: str) -> dict:
        """Put rooms on a floor; creates missing areas and moves areas to this floor. One undo step."""
        if floor_id and fr.async_get(self.hass).async_get_floor(floor_id) is None:
            raise HomeAssistantError(f"Unknown floor {floor_id}")
        area_reg = ar.async_get(self.hass)
        rows = self._rows(floor_id)
        records: list[dict] = []
        placed = []
        for room in rooms:
            pos = self._clamp(room, rows)
            area = area_reg.async_get_area(room["area_id"]) if room.get("area_id") else None
            if area is None:
                name = (room.get("name") or "").strip()[:60]
                if not name:
                    raise HomeAssistantError("A new room needs a name")
                area = area_reg.async_get_area_by_name(name)
                if area is None:
                    area = area_reg.async_create(name, floor_id=floor_id)
                    records.append({"type": "area_created", "target": area.id, "old": None, "new": name})
            if area.floor_id != floor_id:
                records.append(
                    {"type": "area_floor", "target": area.id, "old": area.floor_id, "new": floor_id}
                )
                area_reg.async_update(area.id, floor_id=floor_id)
            records.append(
                {"type": "layout", "target": area.id, "old": self.data["layout"].get(area.id), "new": pos}
            )
            self.data["layout"][area.id] = pos
            placed.append(area.id)
        batch = self._push_undo(None, title, records)
        self._changed()
        return {"placed": placed, "batch": batch}

    def accept_detected(self, floor_id: str | None, rooms: list[dict]) -> dict:
        result = self.place_rooms(floor_id, rooms, "Grundriss")
        self.discard_detected(floor_id)
        return result

    def create_floor(self, name: str, level: int | None) -> str:
        name = (name or "").strip()[:60]
        if not name:
            raise HomeAssistantError("A floor needs a name")
        floor_reg = fr.async_get(self.hass)
        if floor_reg.async_get_floor_by_name(name):
            raise HomeAssistantError(f"Floor {name} exists")
        floor = floor_reg.async_create(name, level=level)
        self._push_undo(
            None, name, [{"type": "floor_created", "target": floor.floor_id, "old": None, "new": name}]
        )
        self._changed()
        return floor.floor_id

    def _refresh_unit(self, pid: str) -> None:
        """Recompute one proposal after a change made on the map."""
        if pid not in self.data["proposals"]:
            return
        fresh = rules.build_proposals(self._inventory()).get(pid)
        if fresh is None:
            del self.data["proposals"][pid]
        else:
            fresh["status"] = self.data["proposals"][pid]["status"]
            self.data["proposals"][pid] = fresh

    def place_item(self, item_id: str, kind: str, area_id: str, x: float, y: float) -> dict:
        """Put a device (or device-less entity) into a room at a spot. Moves it to that area."""
        if ar.async_get(self.hass).async_get_area(area_id) is None:
            raise HomeAssistantError(f"Unknown area {area_id}")
        records: list[dict] = []
        if kind == "device":
            dev_reg = dr.async_get(self.hass)
            dev = dev_reg.async_get(item_id)
            if dev is None:
                raise HomeAssistantError("Device no longer exists")
            title = dev.name_by_user or dev.name or item_id
            if dev.area_id != area_id:
                records.append({"type": "device_area", "target": item_id, "old": dev.area_id, "new": area_id})
                dev_reg.async_update_device(item_id, area_id=area_id)
        else:
            ent_reg = er.async_get(self.hass)
            ent = ent_reg.async_get(item_id)
            if ent is None:
                raise HomeAssistantError("Entity no longer exists")
            state = self.hass.states.get(item_id)
            title = state.name if state else item_id
            if ent.area_id != area_id:
                records.append({"type": "entity_area", "target": item_id, "old": ent.area_id, "new": area_id})
                ent_reg.async_update_entity(item_id, area_id=area_id)
        pos = {"x": round(min(max(float(x), 0.03), 0.97), 3), "y": round(min(max(float(y), 0.03), 0.97), 3)}
        records.append({"type": "pin", "target": item_id, "old": self.data["pins"].get(item_id), "new": pos})
        self.data["pins"][item_id] = pos
        if self.data["shown"].get(item_id) is False:
            records.append({"type": "map_visible", "target": item_id, "old": False, "new": True})
            self.data["shown"][item_id] = True
        # A move inside the same room is not worth an undo step of its own.
        moved_room = any(r["type"] != "pin" for r in records)
        batch = self._push_undo(None, title, records) if moved_room else None
        self._refresh_unit(f"{kind}:{item_id}")
        self._changed()
        return {"batch": batch, "moved_room": moved_room}

    def set_icon(self, item_id: str, mdi: str | None, image: str | None) -> None:
        """Own symbol for a device on the map: an HA icon name or a small picture. None for both = default."""
        icons = self.data.setdefault("icons", {})
        old = icons.get(item_id)
        if image:
            if not image.startswith("data:image/") or len(image) > 200_000:
                raise HomeAssistantError("Icon must be an image below 150 kB")
            icons[item_id] = {"image": image}
        elif mdi:
            if not mdi.strip().startswith("mdi:"):
                raise HomeAssistantError("Icon name must start with mdi:")
            icons[item_id] = {"mdi": mdi.strip()[:64]}
        else:
            icons.pop(item_id, None)
        self._push_undo(
            None, item_id, [{"type": "icon", "target": item_id, "old": old, "new": icons.get(item_id)}]
        )
        self._changed()

    def set_visible(self, item_id: str, visible: bool) -> None:
        old = self.data["shown"].get(item_id)
        self.data["shown"][item_id] = visible
        self._push_undo(
            None, item_id, [{"type": "map_visible", "target": item_id, "old": old, "new": visible}]
        )
        self._changed()

    def devices_overview(self, inv: dict | None = None) -> list[dict]:
        """All devices by integration, for deciding what is still needed. Silent ones first."""
        dev_reg = dr.async_get(self.hass)
        ent_reg = er.async_get(self.hass)
        area_reg = ar.async_get(self.hass)
        groups: dict[str, dict] = {}
        for dev in device_entries(dev_reg):
            if dev.entry_type is dr.DeviceEntryType.SERVICE:
                continue
            entry_id = device_entry_id(dev)
            entry = self.hass.config_entries.async_get_entry(entry_id) if entry_id else None
            entities = er.async_entries_for_device(ent_reg, dev.id, include_disabled_entities=True)
            states = [self.hass.states.get(e.entity_id) for e in entities if not e.disabled_by]
            silent = bool(entities) and all(
                s is None or s.state in ("unavailable", "unknown") or s.attributes.get("restored")
                for s in states
            )
            area = area_reg.async_get_area(dev.area_id) if dev.area_id else None
            domain = entry.domain if entry else "?"
            group = groups.setdefault(
                domain, {"integration": domain, "title": entry.title if entry else "", "devices": []}
            )
            inv_dev = (inv or {}).get("devices", {}).get(dev.id)
            group["devices"].append(
                {
                    "kind": kinds.device_kind(inv, inv_dev) if inv_dev else "other",
                    "area_id": dev.area_id,
                    "device_id": dev.id,
                    "config_entry_id": entry_id,
                    "name": dev.name_by_user or dev.name or dev.model or dev.id,
                    "original_name": dev.name or dev.model or dev.id,
                    "model": " ".join(x for x in (dev.manufacturer, dev.model) if x),
                    "area": area.name if area else None,
                    "entities": len(entities),
                    "entity_names": [
                        (
                            self.hass.states.get(e.entity_id).name
                            if self.hass.states.get(e.entity_id)
                            else e.entity_id
                        )
                        for e in entities
                        if not e.entity_category and not e.disabled_by
                    ][:4],
                    # the functions of the device: which are used, how they are called, what they are
                    "functions": [self._function(inv, e, inv_dev) for e in entities if not e.disabled_by],
                    "silent": silent and not dev.disabled_by,
                    "irrelevant": dev.id in self.data.get("irrelevant", {}),
                    "disabled": dev.disabled_by is not None,
                    "deletable": bool(entry and entry.supports_remove_device),
                }
            )
        for group in groups.values():
            group["devices"].sort(key=lambda d: (not d["silent"], d["disabled"], d["name"].lower()))
            group["silent"] = sum(d["silent"] for d in group["devices"])
        return sorted(groups.values(), key=lambda g: (-g["silent"], g["integration"]))

    def _devices_with_ai(self, inv: dict, ai: dict) -> list[dict]:
        groups = self.devices_overview(inv)
        silent_ai = ai.get("silent") or {}
        switch_ai = ai.get("switches") or {}
        overridden = self.data.get("kind_override", {})
        for g in groups:
            for d in g["devices"]:
                d["ai"] = silent_ai.get(d["device_id"]) if d["silent"] else None
                dev = inv["devices"].get(d["device_id"])
                hint = None
                for entity_id in dev["entity_ids"] if dev else []:
                    if entity_id in switch_ai and entity_id not in overridden:
                        hint = {"entity_id": entity_id, **switch_ai[entity_id]}
                        break
                d["ai_kind"] = hint
        return groups

    def set_device_disabled(self, device_id: str, disabled: bool) -> None:
        """Switch a device (and with it its entities) off or on again. Undoable."""
        dev_reg = dr.async_get(self.hass)
        dev = dev_reg.async_get(device_id)
        if dev is None:
            raise HomeAssistantError("Device no longer exists")
        new = dr.DeviceEntryDisabler.USER if disabled else None
        if dev.disabled_by == new:
            return
        old = dev.disabled_by.value if dev.disabled_by else None
        dev_reg.async_update_device(device_id, disabled_by=new)
        self._push_undo(
            None,
            dev.name_by_user or dev.name or device_id,
            [{"type": "device_disabled", "target": device_id, "old": old, "new": new.value if new else None}],
        )
        self._changed()

    def exposure_overview(self) -> dict:
        """Every entity and whether the voice assistant sees it, to go through and switch."""
        inv = self._inventory()
        floors = {f["floor_id"]: f["name"] for f in inv["floors"].values()}
        merged_away = {o for m in self.data["merged"].values() for o in m["others"]}
        irrelevant = self.data.get("irrelevant", {})
        items = []
        for ent in inv["entities"].values():
            if ent["restored"]:
                continue  # not provided any more: the orphans step deals with those
            dev = inv["devices"].get(ent["device_id"] or "")
            area = inv["areas"].get(duplicates.effective_area(inv, ent) or "")
            items.append(
                {
                    "entity_id": ent["entity_id"],
                    "name": ent["title"],
                    "kind": kinds.entity_kind(ent, dev["name"] if dev else None),
                    "area_id": area["area_id"] if area else None,
                    "area": area["name"] if area else None,
                    "floor": floors.get(area["floor_id"]) if area else None,
                    "device": dev["name"] if dev else None,
                    "aliases": ent["aliases"],
                    "exposed": ent["exposed"],
                    # usually not meant for the assistant; shown on request
                    "technical": bool(ent["entity_category"] or ent["hidden"]),
                    "twin": ent["entity_id"] in merged_away,
                    "irrelevant": bool(dev and dev["device_id"] in irrelevant),
                }
            )
        items.sort(key=lambda x: ((x["area"] or "~").lower(), x["name"].lower()))
        return {"entities": items}

    def _function(self, inv: dict | None, ent: er.RegistryEntry, dev: dict | None) -> dict:
        state = self.hass.states.get(ent.entity_id)
        inv_ent = (inv or {}).get("entities", {}).get(ent.entity_id)
        return {
            "entity_id": ent.entity_id,
            "name": state.name if state else (ent.name or ent.original_name or ent.entity_id),
            "own_name": ent.name,
            "aliases": alias_strings(ent.aliases),
            "kind": kinds.entity_kind(inv_ent, dev["name"] if dev else None) if inv_ent else "other",
            "kind_override": self.data["kind_override"].get(ent.entity_id),
            "exposed": async_should_expose(self.hass, ASSISTANT, ent.entity_id),
            "hidden": ent.hidden_by is not None,
            "technical": ent.entity_category is not None,
        }

    def update_entity(self, entity_id: str, changes: dict) -> dict:
        """One function of a device: used or not, own name, kind, aliases – in one undo step.

        Not used = the assistant does not see it and HA hides it (automations keep working).
        """
        ent_reg = er.async_get(self.hass)
        ent = ent_reg.async_get(entity_id)
        if ent is None:
            raise HomeAssistantError("Only entities with a registry entry can be changed here")
        records: list[dict] = []
        if "use" in changes:
            use = bool(changes["use"])
            old = async_should_expose(self.hass, ASSISTANT, entity_id)
            if old != use:
                records.append({"type": "entity_exposed", "target": entity_id, "old": old, "new": use})
                async_expose_entity(self.hass, ASSISTANT, entity_id, use)
            if not use and ent.hidden_by is None:
                records.append({"type": "entity_hidden", "target": entity_id, "old": None, "new": "user"})
                ent_reg.async_update_entity(entity_id, hidden_by=er.RegistryEntryHider.USER)
            elif use and ent.hidden_by is er.RegistryEntryHider.USER:
                records.append({"type": "entity_hidden", "target": entity_id, "old": "user", "new": None})
                ent_reg.async_update_entity(entity_id, hidden_by=None)
        if "name" in changes:
            name = (changes["name"] or "").strip()[:100] or None
            if name != ent.name:
                records.append({"type": "entity_name", "target": entity_id, "old": ent.name, "new": name})
                ent_reg.async_update_entity(entity_id, name=name)
        if isinstance(changes.get("aliases"), list):
            clean: list[str] = []
            for alias in changes["aliases"]:
                if isinstance(alias, str) and (alias := alias.strip()[:60]) and alias not in clean:
                    clean.append(alias)
            if clean != alias_strings(ent.aliases):
                records.append(
                    {
                        "type": "entity_aliases",
                        "target": entity_id,
                        "old": serialize_aliases(ent.aliases),
                        "new": clean,
                    }
                )
                ent_reg.async_update_entity(entity_id, aliases=build_aliases(ent.aliases, clean))
        if "kind" in changes:
            kind = changes["kind"] or None
            old_kind = self.data["kind_override"].get(entity_id)
            if kind != old_kind:
                records.append({"type": "kind_override", "target": entity_id, "old": old_kind, "new": kind})
                if kind:
                    self.data["kind_override"][entity_id] = kind
                else:
                    self.data["kind_override"].pop(entity_id, None)
        if records:
            self._push_undo(None, changes.get("name") or ent.name or ent.original_name or entity_id, records)
            self._changed()
        ent = ent_reg.async_get(entity_id)
        return {"changes": len(records), "aliases": alias_strings(ent.aliases)}

    def set_entity_aliases(self, entity_id: str, aliases: list[str]) -> list[str]:
        return self.update_entity(entity_id, {"aliases": aliases})["aliases"]

    def set_exposed(self, entity_ids: list[str], exposed: bool) -> dict:
        """Show entities to the voice assistant or take them away, in one undo step."""
        records = []
        for entity_id in entity_ids:
            if (
                self.hass.states.get(entity_id) is None
                and er.async_get(self.hass).async_get(entity_id) is None
            ):
                continue
            old = async_should_expose(self.hass, ASSISTANT, entity_id)
            if old == exposed:
                continue
            records.append({"type": "entity_exposed", "target": entity_id, "old": old, "new": exposed})
            async_expose_entity(self.hass, ASSISTANT, entity_id, exposed)
        if records:
            title = records[0]["target"] if len(records) == 1 else f"{len(records)} Entitäten"
            self._push_undo(None, title, records)
            self._changed()
        return {"changes": len(records)}

    def set_irrelevant(self, device_id: str, irrelevant: bool) -> dict:
        """Not relevant for the home: off the room lists, not for the assistant, not on the map. Undoable.

        Showing it again only lifts the mark; exposure and map come back with "undo".
        """
        dev = dr.async_get(self.hass).async_get(device_id)
        if dev is None:
            raise HomeAssistantError("Device no longer exists")
        marks = self.data.setdefault("irrelevant", {})
        old = marks.get(device_id)
        if bool(old) == irrelevant:
            return {"changes": 0}
        records = [
            {"type": "irrelevant", "target": device_id, "old": old, "new": True if irrelevant else None}
        ]
        if irrelevant:
            marks[device_id] = True
            for ent in er.async_entries_for_device(er.async_get(self.hass), device_id):
                if async_should_expose(self.hass, ASSISTANT, ent.entity_id):
                    records.append(
                        {"type": "entity_exposed", "target": ent.entity_id, "old": True, "new": False}
                    )
                    async_expose_entity(self.hass, ASSISTANT, ent.entity_id, False)
            if self.data["shown"].get(device_id) is not False:
                records.append(
                    {
                        "type": "map_visible",
                        "target": device_id,
                        "old": self.data["shown"].get(device_id),
                        "new": False,
                    }
                )
                self.data["shown"][device_id] = False
            self.data["proposals"].pop(f"device:{device_id}", None)
        else:
            marks.pop(device_id, None)
            pid = f"device:{device_id}"
            if (fresh := rules.build_proposals(self._inventory()).get(pid)) is not None:
                self.data["proposals"].update(self._merge_with_decisions({pid: fresh}))
        self._push_undo(None, dev.name_by_user or dev.name or device_id, records)
        self._changed()
        return {"changes": len(records)}

    def remove_orphans(self, entity_ids: list[str]) -> dict:
        """Remove the chosen registry entries, but only those still not provided by anyone."""
        ent_reg = er.async_get(self.hass)
        records = []
        for entity_id in entity_ids:
            state = self.hass.states.get(entity_id)
            if ent_reg.async_get(entity_id) is None or not (state and state.attributes.get("restored")):
                continue
            records.append({"type": "entity_removed", "target": entity_id, "old": None, "new": None})
            ent_reg.async_remove(entity_id)
        self._push_undo(None, f"{len(records)} verwaiste Entitäten", records)
        self._changed()
        return {"removed": len(records)}

    def description_text(self) -> str:
        return description.build_description(
            self._inventory(),
            self.data["layout"],
            self.data["notes"],
            self.hass.config.language,
            self.groups(),
        )

    # --- reading --------------------------------------------------------

    def _for_panel(self, prop: dict, inv: dict) -> dict:
        """A proposal plus what the panel shows besides: kinds and the map box."""
        prop = self._with_map_choice(prop)
        key = description.map_id(prop)
        if prop["kind"] == "device" and key in inv["devices"]:
            dev = inv["devices"][key]
            prop["what"] = kinds.device_kind(inv, dev)
            dev_name = dev.get("name")
        else:
            dev_name = None
            ent = inv["entities"].get(key)
            prop["what"] = kinds.entity_kind(ent) if ent else "other"
        prop["entities"] = [
            {**r, "what": kinds.entity_kind(inv["entities"][r["entity_id"]], dev_name)}
            if r["entity_id"] in inv["entities"]
            else r
            for r in prop["entities"]
        ]
        return prop

    def _with_map_choice(self, prop: dict) -> dict:
        """Whether the card's "show on map" box starts ticked."""
        shown = self.data["shown"].get(description.map_id(prop))
        if shown is None:
            shown = "speaker" in prop["flags"] or any(
                r["proposed"]["exposed"] and not r["proposed"]["remove"] for r in prop["entities"]
            )
        return {**prop, "on_map": shown}

    def snapshot(self) -> dict:
        """Everything the panel shows."""
        inv = self._inventory()
        floors = inv["floors"]
        areas = sorted(
            (
                {
                    "area_id": a["area_id"],
                    "name": a["name"],
                    "floor": floors[a["floor_id"]]["name"] if a.get("floor_id") in floors else None,
                    "level": floors[a["floor_id"]]["level"] if a.get("floor_id") in floors else None,
                }
                for a in inv["areas"].values()
            ),
            key=lambda a: (a["level"] is None, a["level"] or 0, a["floor"] or "", a["name"]),
        )
        open_ids = self._open_ids()
        ai = self.data.get("ai") or {}
        groups = self.groups()
        sensor = er.async_get(self.hass).async_get_entity_id("sensor", DOMAIN, SENSOR_UNIQUE_ID)
        return {
            "version": VERSION,
            "map": description.build_map(
                inv,
                self.data["layout"],
                self.data["notes"],
                open_ids,
                self.data["plans"],
                self.data["pins"],
                self.data["shown"],
                self.data["merged"],
                self.data.get("icons", {}),
                groups,
            ),
            "description": description.build_description(
                inv, self.data["layout"], self.data["notes"], self.hass.config.language, groups
            ),
            "sensor": sensor,
            "orphans": [
                {**g, "ai": (ai.get("orphans") or {}).get(g["integration"])} for g in rules.orphans(inv)
            ],
            "devices": self._devices_with_ai(inv, ai),
            "duplicates": [
                {**g, "ai": (ai.get("duplicates") or {}).get(g["key"])}
                for g in self.data["duplicates"]
                if g["key"] not in self.data["dup_decisions"]
            ],
            "ai": self._ai_view(inv),
            "groups": groups,
            "wizard": self.data.get("wizard")
            or {"pos": None, "done": [], "finished": False, "dismissed": False},
            "merged": [
                {
                    "key": k,
                    "title": m["title"],
                    "primary": m["primary"],
                    "members": m["members"],
                    "at": m["at"],
                }
                for k, m in self.data["merged"].items()
            ],
            "history_checked": self.data.get("history_checked", False),
            "progress": self.progress,
            "last_scan": self.data["last_scan"],
            "llm": llm.configured(self.options),
            "areas": areas,
            "proposals": sorted(
                (self._for_panel(p, inv) for p in self.data["proposals"].values()),
                key=lambda p: (
                    p["status"] != STATUS_OPEN,
                    "speaker" not in p["flags"],
                    not p["safe"],
                    p["title"].lower(),
                ),
            ),
            "ignored": [
                {"id": pid, "title": d.get("title", pid), "at": d["at"]}
                for pid, d in self.data["decisions"].items()
                if d["status"] == STATUS_IGNORED
            ],
            "history": [
                {"batch": b["batch"], "title": b["title"], "at": b["at"], "changes": len(b["records"])}
                for b in reversed(self.data["undo"][-30:])
            ],
        }
