
const envlocal = __dirname + '/../../../.env.local'
require('dotenv').config({ quiet: true, path: [envlocal] })

const Path = require('node:path')
const Fs = require('node:fs')

const { test, describe } = require('node:test')
const assert = require('node:assert')


const { ChecklyhqSDK, BaseFeature, stdutil, config } = require('../../..')

const {
  envOverride,
  makeCtrl,
  makeMatch,
  makeReqdata,
  makeStepData,
  makeValid,
} = require('../../utility')


describe('CheckEntity', async () => {

  test('instance', async () => {
    const testsdk = ChecklyhqSDK.test()
    const ent = testsdk.Check()
    assert(null != ent)
  })


  test('basic', async () => {

    const setup = basicSetup()
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
    const check_ref01_match = {}

    const check_ref01_list = (await check_ref01_ent.list(check_ref01_match)).map((e) => e.data())

    assert(!isempty(select(check_ref01_list, { id: check_ref01_data.id })))


    // UPDATE
    const check_ref01_data_up0 = {}
    check_ref01_data_up0.id = check_ref01_data.id

    const check_ref01_markdef_up0 = { name: 'checkType', value: 'Mark01-check_ref01_' + setup.now }
    check_ref01_data_up0 [check_ref01_markdef_up0.name] = check_ref01_markdef_up0.value

    const check_ref01_resdata_up0 = (await check_ref01_ent.update(check_ref01_data_up0)).data()
    assert(check_ref01_resdata_up0.id === check_ref01_data_up0.id)

    assert(check_ref01_resdata_up0[check_ref01_markdef_up0.name] === check_ref01_markdef_up0.value)


    // LOAD
    const check_ref01_match_dt0 = {}
    check_ref01_match_dt0.id = check_ref01_data.id
    const check_ref01_data_dt0 = (await check_ref01_ent.load(check_ref01_match_dt0)).data()
    assert(check_ref01_data_dt0.id === check_ref01_data.id)


    // REMOVE
    const check_ref01_match_rm0 = {}
    check_ref01_match_rm0.id = check_ref01_data.id
    await check_ref01_ent.remove(check_ref01_match_rm0)
  

    // LIST
    const check_ref01_match_rt0 = {}

    const check_ref01_list_rt0 = (await check_ref01_ent.list(check_ref01_match_rt0)).map((e) => e.data())

    assert(isempty(select(check_ref01_list_rt0, { id: check_ref01_data.id })))


  })
})



function basicSetup(extra) {
  // TODO: fix test def options
  const options = {} // null

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

  const env = envOverride({
    'CHECKLYHQ_TEST_CHECK_ENTID': idmap,
    'CHECKLYHQ_TEST_LIVE': 'FALSE',
    'CHECKLYHQ_TEST_EXPLAIN': 'FALSE',
    'CHECKLYHQ_APIKEY': 'NONE',
  })

  idmap = env['CHECKLYHQ_TEST_CHECK_ENTID']

  if ('TRUE' === env.CHECKLYHQ_TEST_LIVE) {
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
    now: Date.now(),
  }

  return setup
}
  
