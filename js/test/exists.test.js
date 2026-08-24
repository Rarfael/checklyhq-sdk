
const { test, describe } = require('node:test')
const { equal } = require('node:assert')


const { ChecklyhqSDK } = require('..')


describe('exists', async () => {

  test('test-mode', async () => {
    const testsdk = await ChecklyhqSDK.test()
    equal(null !== testsdk, true)
  })

})
