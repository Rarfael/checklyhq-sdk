-- Checklyhq SDK exists test

local sdk = require("checklyhq_sdk")

describe("ChecklyhqSDK", function()
  it("should create test SDK", function()
    local testsdk = sdk.test(nil, nil)
    assert.is_not_nil(testsdk)
  end)
end)
