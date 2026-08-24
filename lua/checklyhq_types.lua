-- Typed models for the Checklyhq SDK (LuaLS annotations).
--
-- GENERATED from the API model: main.kit.entity.<e>.fields[] and per-op
-- params (op.<name>.points[].args.params[]). Field/param types come from the
-- canonical type sentinels via @voxgig/sdkgen canonToType (source of truth:
-- @voxgig/apidef VALID_CANON). Annotations only — no runtime effect. Do not
-- edit by hand.

---@class Check
---@field activated? boolean
---@field checkType? string
---@field created_at? string
---@field frequency? number
---@field id? string
---@field locations? table
---@field muted? boolean
---@field name? string
---@field request? table
---@field updated_at? string

---@class CheckLoadMatch
---@field id string

---@class CheckListMatch
---@field activated? boolean
---@field checkType? string
---@field created_at? string
---@field frequency? number
---@field id? string
---@field locations? table
---@field muted? boolean
---@field name? string
---@field request? table
---@field updated_at? string

---@class CheckCreateData
---@field activated? boolean
---@field checkType? string
---@field created_at? string
---@field frequency? number
---@field id? string
---@field locations? table
---@field muted? boolean
---@field name? string
---@field request? table
---@field updated_at? string

---@class CheckUpdateData
---@field id string
---@field activated? boolean
---@field checkType? string
---@field created_at? string
---@field frequency? number
---@field locations? table
---@field muted? boolean
---@field name? string
---@field request? table
---@field updated_at? string

---@class CheckRemoveMatch
---@field id string

local M = {}

return M
