// Typed models for the Checklyhq SDK.
//
// GENERATED from the API model: main.kit.entity.<e>.fields[] and per-op
// params (op.<name>.points[].args.params[]). Field/param types come from the
// canonical type sentinels via @voxgig/sdkgen canonToType (source of truth:
// @voxgig/apidef VALID_CANON). Do not edit by hand.

export interface Check {
  activated?: boolean
  checkType?: string
  created_at?: string
  frequency?: number
  id?: string
  locations?: any[]
  muted?: boolean
  name?: string
  request?: Record<string, any>
  updated_at?: string
}

export interface CheckLoadMatch {
  id: string
}

export interface CheckListMatch {
  activated?: boolean
  checkType?: string
  created_at?: string
  frequency?: number
  id?: string
  locations?: any[]
  muted?: boolean
  name?: string
  request?: Record<string, any>
  updated_at?: string
}

export interface CheckCreateData {
  activated?: boolean
  checkType?: string
  created_at?: string
  frequency?: number
  id?: string
  locations?: any[]
  muted?: boolean
  name?: string
  request?: Record<string, any>
  updated_at?: string
}

export interface CheckUpdateData {
  id: string
  activated?: boolean
  checkType?: string
  created_at?: string
  frequency?: number
  locations?: any[]
  muted?: boolean
  name?: string
  request?: Record<string, any>
  updated_at?: string
}

export interface CheckRemoveMatch {
  id: string
}

