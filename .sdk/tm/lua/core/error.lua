-- Checklyhq SDK error

local ChecklyhqError = {}
ChecklyhqError.__index = ChecklyhqError


function ChecklyhqError.new(code, msg, ctx)
  local self = setmetatable({}, ChecklyhqError)
  self.is_sdk_error = true
  self.sdk = "Checklyhq"
  self.code = code or ""
  self.msg = msg or ""
  self.ctx = ctx
  self.result = nil
  self.spec = nil
  return self
end


function ChecklyhqError:error()
  return self.msg
end


function ChecklyhqError:__tostring()
  return self.msg
end


return ChecklyhqError
