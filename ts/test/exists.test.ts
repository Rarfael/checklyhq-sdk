
import { test, describe } from 'node:test'
import { equal } from 'node:assert'


import { ChecklyhqSDK } from '..'


describe('exists', async () => {

  test('test-mode', async () => {
    const testsdk = await ChecklyhqSDK.test()
    equal(null !== testsdk, true)
  })

})
