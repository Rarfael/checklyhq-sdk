# Typed models for the Checklyhq SDK.
#
# GENERATED from the API model: main.kit.entity.<e>.fields[] and per-op
# params (op.<name>.points[].args.params[]). Field/param types come from the
# canonical type sentinels via @voxgig/sdkgen canonToType (source of truth:
# @voxgig/apidef VALID_CANON). Do not edit by hand.
#
# These are TypedDicts, not dataclasses: the SDK ops return/accept plain dicts
# at runtime, and a TypedDict IS a dict shape, so the types match the runtime.
# Optional (req:false) keys are modelled as TypedDict key-optionality
# (total=False), split into a required base + total=False subclass when a type
# has both required and optional keys.

from __future__ import annotations

from typing import TypedDict, Any


class Check(TypedDict, total=False):
    activated: bool
    checkType: str
    created_at: str
    frequency: int
    id: str
    locations: list
    muted: bool
    name: str
    request: dict
    updated_at: str


class CheckLoadMatch(TypedDict):
    id: str


class CheckListMatch(TypedDict, total=False):
    activated: bool
    checkType: str
    created_at: str
    frequency: int
    id: str
    locations: list
    muted: bool
    name: str
    request: dict
    updated_at: str


class CheckCreateData(TypedDict, total=False):
    activated: bool
    checkType: str
    created_at: str
    frequency: int
    id: str
    locations: list
    muted: bool
    name: str
    request: dict
    updated_at: str


class CheckUpdateDataRequired(TypedDict):
    id: str


class CheckUpdateData(CheckUpdateDataRequired, total=False):
    activated: bool
    checkType: str
    created_at: str
    frequency: int
    locations: list
    muted: bool
    name: str
    request: dict
    updated_at: str


class CheckRemoveMatch(TypedDict):
    id: str
