
const envlocal = __dirname + '/../../../.env.local'
require('dotenv').config({ quiet: true, path: [envlocal] })

import Path from 'node:path'
import * as Fs from 'node:fs'

import { test, describe, afterEach } from 'node:test'
import assert from 'node:assert'


import { ChecklyhqSDK, BaseFeature, stdutil } from '../../..'

import {
  envOverride,
  liveDelay,
  makeCtrl,
  makeMatch,
  makeReqdata,
  makeStepData,
  makeValid,
  maybeSkipControl,
} from '../../utility'


describe('CheckEntity', async () => {

  // Per-test live pacing. Delay is read from sdk-test-control.json's
  // `test.live.delayMs`; only sleeps when CHECKLYHQ_TEST_LIVE=TRUE.
  afterEach(liveDelay('CHECKLYHQ_TEST_LIVE'))

  test('instance', async () => {
    const testsdk = ChecklyhqSDK.test()
    const ent = testsdk.Check()
    assert(null != ent)
  })


  test('basic', async (t) => {

    const live = 'TRUE' === process.env.CHECKLYHQ_TEST_LIVE
    for (const op of ['create', 'list', 'update', 'load', 'remove']) {
      if (maybeSkipControl(t, 'entityOp', 'check.' + op, live)) return
    }

    const setup = basicSetup()
    // The basic flow consumes synthetic IDs and field values from the
    // fixture (entity TestData.json). Those don't exist on the live API.
    // Skip live runs unless the user provided a real ENTID env override.
    if (setup.syntheticOnly) {
      t.skip('live entity test uses synthetic IDs from fixture — set CHECKLYHQ_TEST_CHECK_ENTID JSON to run live')
      return
    }
    const client = setup.client
    const struct = setup.struct

    const isempty = struct.isempty
    const select = struct.select


    // CREATE
    const check_ref01_ent = client.Check()
    let check_ref01_data = setup.data.new.check['check_ref01']

    check_ref01_data = (await check_ref01_ent.create(check_ref01_data)).data()
    assert(null != check_ref01_data.id)


    // LIST
    const check_ref01_match: any = {}

    const check_ref01_list = (await check_ref01_ent.list(check_ref01_match)).map((e: any) => e.data())

    assert(!isempty(select(check_ref01_list, { id: check_ref01_data.id })))


    // UPDATE
    const check_ref01_data_up0: any = {}
    check_ref01_data_up0.id = check_ref01_data.id

    const check_ref01_markdef_up0 = { name: 'checkType', value: 'Mark01-check_ref01_' + setup.now }
    ;(check_ref01_data_up0 as any)[check_ref01_markdef_up0.name] = check_ref01_markdef_up0.value

    const check_ref01_resdata_up0 = (await check_ref01_ent.update(check_ref01_data_up0)).data()
    assert(check_ref01_resdata_up0.id === check_ref01_data_up0.id)

    assert((check_ref01_resdata_up0 as any)[check_ref01_markdef_up0.name] === check_ref01_markdef_up0.value)


    // LOAD
    const check_ref01_match_dt0: any = {}
    check_ref01_match_dt0.id = check_ref01_data.id
    const check_ref01_data_dt0 = (await check_ref01_ent.load(check_ref01_match_dt0)).data()
    assert(check_ref01_data_dt0.id === check_ref01_data.id)


    // REMOVE
    const check_ref01_match_rm0: any = { id: check_ref01_data.id }
    await check_ref01_ent.remove(check_ref01_match_rm0)
  

    // LIST
    const check_ref01_match_rt0: any = {}

    const check_ref01_list_rt0 = (await check_ref01_ent.list(check_ref01_match_rt0)).map((e: any) => e.data())

    assert(isempty(select(check_ref01_list_rt0, { id: check_ref01_data.id })))


  })
})



function basicSetup(extra?: any) {
  // TODO: fix test def options
  const options: any = {} // null

  // TODO: needs test utility to resolve path
  const entityDataFile =
    Path.resolve(__dirname, 
      '../../../../.sdk/test/entity/check/CheckTestData.json')

  // TODO: file ready util needed?
  const entityDataSource = Fs.readFileSync(entityDataFile).toString('utf8')

  // TODO: need a xlang JSON parse utility in voxgig/struct with better error msgs
  const entityData = JSON.parse(entityDataSource)

  options.entity = entityData.existing

  let client = ChecklyhqSDK.test(options, extra)
  const struct = client.utility().struct
  const merge = struct.merge
  const transform = struct.transform

  let idmap = transform(
    ['check01','check02','check03'],
    {
      '`$PACK`': ['', {
        '`$KEY`': '`$COPY`',
        '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
      }]
    })

  // Detect whether the user provided a real ENTID JSON via env var. The
  // basic flow consumes synthetic IDs from the fixture file; without an
  // override those synthetic IDs reach the live API and 4xx. Surface this
  // to the test so it can skip rather than fail.
  const idmapEnvVal = process.env['CHECKLYHQ_TEST_CHECK_ENTID']
  const idmapOverridden = null != idmapEnvVal && idmapEnvVal.trim().startsWith('{')

  const env = envOverride({
    'CHECKLYHQ_TEST_CHECK_ENTID': idmap,
    'CHECKLYHQ_TEST_LIVE': 'FALSE',
    'CHECKLYHQ_TEST_EXPLAIN': 'FALSE',
    'CHECKLYHQ_APIKEY': 'NONE',
  })

  idmap = env['CHECKLYHQ_TEST_CHECK_ENTID']

  const live = 'TRUE' === env.CHECKLYHQ_TEST_LIVE

  if (live) {
    client = new ChecklyhqSDK(merge([
      {
        apikey: env.CHECKLYHQ_APIKEY,
      },
      extra
    ]))
  }

  const setup = {
    idmap,
    env,
    options,
    client,
    struct,
    data: entityData,
    explain: 'TRUE' === env.CHECKLYHQ_TEST_EXPLAIN,
    live,
    syntheticOnly: live && !idmapOverridden,
    now: Date.now(),
  }

  return setup
}
  
