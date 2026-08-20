"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const envlocal = __dirname + '/../../../.env.local';
require('dotenv').config({ quiet: true, path: [envlocal] });
const node_path_1 = __importDefault(require("node:path"));
const Fs = __importStar(require("node:fs"));
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const __1 = require("../../..");
const utility_1 = require("../../utility");
(0, node_test_1.describe)('CheckEntity', async () => {
    // Per-test live pacing. Delay is read from sdk-test-control.json's
    // `test.live.delayMs`; only sleeps when CHECKLYHQ_TEST_LIVE=TRUE.
    (0, node_test_1.afterEach)((0, utility_1.liveDelay)('CHECKLYHQ_TEST_LIVE'));
    (0, node_test_1.test)('instance', async () => {
        const testsdk = __1.ChecklyhqSDK.test();
        const ent = testsdk.Check();
        (0, node_assert_1.default)(null != ent);
    });
    (0, node_test_1.test)('basic', async (t) => {
        const live = 'TRUE' === process.env.CHECKLYHQ_TEST_LIVE;
        for (const op of ['create', 'list', 'update', 'load', 'remove']) {
            if ((0, utility_1.maybeSkipControl)(t, 'entityOp', 'check.' + op, live))
                return;
        }
        const setup = basicSetup();
        // The basic flow consumes synthetic IDs and field values from the
        // fixture (entity TestData.json). Those don't exist on the live API.
        // Skip live runs unless the user provided a real ENTID env override.
        if (setup.syntheticOnly) {
            t.skip('live entity test uses synthetic IDs from fixture — set CHECKLYHQ_TEST_CHECK_ENTID JSON to run live');
            return;
        }
        const client = setup.client;
        const struct = setup.struct;
        const isempty = struct.isempty;
        const select = struct.select;
        // CREATE
        const check_ref01_ent = client.Check();
        let check_ref01_data = setup.data.new.check['check_ref01'];
        check_ref01_data = (await check_ref01_ent.create(check_ref01_data)).data();
        (0, node_assert_1.default)(null != check_ref01_data.id);
        // LIST
        const check_ref01_match = {};
        const check_ref01_list = (await check_ref01_ent.list(check_ref01_match)).map((e) => e.data());
        (0, node_assert_1.default)(!isempty(select(check_ref01_list, { id: check_ref01_data.id })));
        // UPDATE
        const check_ref01_data_up0 = {};
        check_ref01_data_up0.id = check_ref01_data.id;
        const check_ref01_markdef_up0 = { name: 'checkType', value: 'Mark01-check_ref01_' + setup.now };
        check_ref01_data_up0[check_ref01_markdef_up0.name] = check_ref01_markdef_up0.value;
        const check_ref01_resdata_up0 = (await check_ref01_ent.update(check_ref01_data_up0)).data();
        (0, node_assert_1.default)(check_ref01_resdata_up0.id === check_ref01_data_up0.id);
        (0, node_assert_1.default)(check_ref01_resdata_up0[check_ref01_markdef_up0.name] === check_ref01_markdef_up0.value);
        // LOAD
        const check_ref01_match_dt0 = {};
        check_ref01_match_dt0.id = check_ref01_data.id;
        const check_ref01_data_dt0 = (await check_ref01_ent.load(check_ref01_match_dt0)).data();
        (0, node_assert_1.default)(check_ref01_data_dt0.id === check_ref01_data.id);
        // REMOVE
        const check_ref01_match_rm0 = { id: check_ref01_data.id };
        await check_ref01_ent.remove(check_ref01_match_rm0);
        // LIST
        const check_ref01_match_rt0 = {};
        const check_ref01_list_rt0 = (await check_ref01_ent.list(check_ref01_match_rt0)).map((e) => e.data());
        (0, node_assert_1.default)(isempty(select(check_ref01_list_rt0, { id: check_ref01_data.id })));
    });
});
function basicSetup(extra) {
    // TODO: fix test def options
    const options = {}; // null
    // TODO: needs test utility to resolve path
    const entityDataFile = node_path_1.default.resolve(__dirname, '../../../../.sdk/test/entity/check/CheckTestData.json');
    // TODO: file ready util needed?
    const entityDataSource = Fs.readFileSync(entityDataFile).toString('utf8');
    // TODO: need a xlang JSON parse utility in voxgig/struct with better error msgs
    const entityData = JSON.parse(entityDataSource);
    options.entity = entityData.existing;
    let client = __1.ChecklyhqSDK.test(options, extra);
    const struct = client.utility().struct;
    const merge = struct.merge;
    const transform = struct.transform;
    let idmap = transform(['check01', 'check02', 'check03'], {
        '`$PACK`': ['', {
                '`$KEY`': '`$COPY`',
                '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
            }]
    });
    // Detect whether the user provided a real ENTID JSON via env var. The
    // basic flow consumes synthetic IDs from the fixture file; without an
    // override those synthetic IDs reach the live API and 4xx. Surface this
    // to the test so it can skip rather than fail.
    const idmapEnvVal = process.env['CHECKLYHQ_TEST_CHECK_ENTID'];
    const idmapOverridden = null != idmapEnvVal && idmapEnvVal.trim().startsWith('{');
    const env = (0, utility_1.envOverride)({
        'CHECKLYHQ_TEST_CHECK_ENTID': idmap,
        'CHECKLYHQ_TEST_LIVE': 'FALSE',
        'CHECKLYHQ_TEST_EXPLAIN': 'FALSE',
        'CHECKLYHQ_APIKEY': 'NONE',
    });
    idmap = env['CHECKLYHQ_TEST_CHECK_ENTID'];
    const live = 'TRUE' === env.CHECKLYHQ_TEST_LIVE;
    if (live) {
        client = new __1.ChecklyhqSDK(merge([
            {
                apikey: env.CHECKLYHQ_APIKEY,
            },
            extra
        ]));
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
    };
    return setup;
}
//# sourceMappingURL=CheckEntity.test.js.map