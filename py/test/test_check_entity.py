# Check entity test

import json
import os
import time

import pytest

from checklyhq_sdk.utility.voxgig_struct import voxgig_struct as vs
from checklyhq_sdk import ChecklyhqSDK
from checklyhq_sdk.core import helpers

_TEST_DIR = os.path.dirname(os.path.abspath(__file__))
from test import runner


class TestCheckEntity:

    def test_should_create_instance(self):
        testsdk = ChecklyhqSDK.test(None, None)
        ent = testsdk.Check(None)
        assert ent is not None

    def test_should_stream(self):
        # Feature #4: the entity stream(action, ...) method runs the op
        # pipeline and yields result items. With the streaming feature active
        # it yields the feature's incremental output; otherwise it falls back
        # to the materialised list so stream always yields.
        seed = {
            "entity": {
                "check": {
                    "s1": {"id": "s1"},
                    "s2": {"id": "s2"},
                    "s3": {"id": "s3"},
                }
            }
        }

        # Fallback: streaming inactive -> yields the materialised list items.
        base = ChecklyhqSDK.test(seed, None)
        seen = list(base.Check(None).stream("list", None, None))
        assert len(seen) == 3

        # Inbound: streaming active -> yields each item from the feature.
        from checklyhq_sdk.config import shared_config
        cfg = shared_config()
        if isinstance(cfg.get("feature"), dict) and "streaming" in cfg["feature"]:
            sdk = ChecklyhqSDK.test(
                seed, {"feature": {"streaming": {"active": True}}})
            got = []
            for item in sdk.Check(None).stream("list", None, None):
                if isinstance(item, list):
                    got.extend(item)
                else:
                    got.append(item)
            assert len(got) == 3

    def test_should_run_basic_flow(self):
        setup = _check_basic_setup(None)
        # Per-op sdk-test-control.json skip — basic test exercises a flow with
        # multiple ops; skipping any one skips the whole flow (steps depend
        # on each other).
        _live = setup.get("live", False)
        for _op in ["create", "list", "update", "load", "remove"]:
            _skip, _reason = runner.is_control_skipped("entityOp", "check." + _op, "live" if _live else "unit")
            if _skip:
                pytest.skip(_reason or "skipped via sdk-test-control.json")
                return
        # The basic flow consumes synthetic IDs from the fixture. In live mode
        # without an *_ENTID env override, those IDs hit the live API and 4xx.
        if setup.get("synthetic_only"):
            pytest.skip("live entity test uses synthetic IDs from fixture — "
                        "set CHECKLYHQ_TEST_CHECK_ENTID JSON to run live")
        client = setup["client"]

        # CREATE
        check_ref01_ent = client.Check(None)
        check_ref01_data = helpers.to_map(vs.getprop(
            vs.getpath(setup["data"], "new.check"), "check_ref01"))

        check_ref01_data = helpers.to_map(runner.entity_data(check_ref01_ent.create(check_ref01_data, None)))
        assert check_ref01_data is not None
        assert check_ref01_data["id"] is not None

        # LIST
        check_ref01_match = {}

        check_ref01_list_result = check_ref01_ent.list(check_ref01_match, None)
        assert isinstance(check_ref01_list_result, list)

        found_item = vs.select(
            runner.entity_list_to_data(check_ref01_list_result),
            {"id": check_ref01_data["id"]})
        assert not vs.isempty(found_item)

        # UPDATE
        check_ref01_data_up0_up = {
            "id": check_ref01_data["id"],
        }

        check_ref01_markdef_up0_name = "checkType"
        check_ref01_markdef_up0_value = "Mark01-check_ref01_" + str(setup["now"])
        check_ref01_data_up0_up[check_ref01_markdef_up0_name] = check_ref01_markdef_up0_value

        check_ref01_resdata_up0 = helpers.to_map(runner.entity_data(check_ref01_ent.update(check_ref01_data_up0_up, None)))
        assert check_ref01_resdata_up0 is not None
        assert check_ref01_resdata_up0["id"] == check_ref01_data_up0_up["id"]
        assert check_ref01_resdata_up0[check_ref01_markdef_up0_name] == check_ref01_markdef_up0_value

        # LOAD
        check_ref01_match_dt0 = {
            "id": check_ref01_data["id"],
        }
        check_ref01_data_dt0_loaded = check_ref01_ent.load(check_ref01_match_dt0, None)
        check_ref01_data_dt0_load_result = helpers.to_map(runner.entity_data(check_ref01_data_dt0_loaded))
        assert check_ref01_data_dt0_load_result is not None
        assert check_ref01_data_dt0_load_result["id"] == check_ref01_data["id"]

        # REMOVE
        check_ref01_match_rm0 = {
            "id": check_ref01_data["id"],
        }
        check_ref01_ent.remove(check_ref01_match_rm0, None)

        # LIST
        check_ref01_match_rt0 = {}

        check_ref01_list_rt0_result = check_ref01_ent.list(check_ref01_match_rt0, None)
        assert isinstance(check_ref01_list_rt0_result, list)

        not_found_item = vs.select(
            runner.entity_list_to_data(check_ref01_list_rt0_result),
            {"id": check_ref01_data["id"]})
        assert vs.isempty(not_found_item)



def _check_basic_setup(extra):
    runner.load_env_local()

    entity_data_file = os.path.join(_TEST_DIR, "../../.sdk/test/entity/check/CheckTestData.json")
    with open(entity_data_file, "r") as f:
        entity_data_source = f.read()

    entity_data = json.loads(entity_data_source)

    options = {}
    options["entity"] = entity_data.get("existing")

    client = ChecklyhqSDK.test(options, extra)

    # Generate idmap via transform.
    idmap = vs.transform(
        ["check01", "check02", "check03"],
        {
            "`$PACK`": ["", {
                "`$KEY`": "`$COPY`",
                "`$VAL`": ["`$FORMAT`", "upper", "`$COPY`"],
            }],
        }
    )

    # Detect ENTID env override before envOverride consumes it. When live
    # mode is on without a real override, the basic test runs against synthetic
    # IDs from the fixture and 4xx's. We surface this so the test can skip.
    _entid_env_raw = os.environ.get(
        "CHECKLYHQ_TEST_CHECK_ENTID")
    _idmap_overridden = _entid_env_raw is not None and _entid_env_raw.strip().startswith("{")

    env = runner.env_override({
        "CHECKLYHQ_TEST_CHECK_ENTID": idmap,
        "CHECKLYHQ_TEST_LIVE": "FALSE",
        "CHECKLYHQ_TEST_EXPLAIN": "FALSE",
        "CHECKLYHQ_APIKEY": "NONE",
    })

    idmap_resolved = helpers.to_map(
        env.get("CHECKLYHQ_TEST_CHECK_ENTID"))
    if idmap_resolved is None:
        idmap_resolved = helpers.to_map(idmap)

    if env.get("CHECKLYHQ_TEST_LIVE") == "TRUE":
        merged_opts = vs.merge([
            {
                "apikey": env.get("CHECKLYHQ_APIKEY"),
            },
            extra or {},
        ])
        client = ChecklyhqSDK(helpers.to_map(merged_opts))

    _live = env.get("CHECKLYHQ_TEST_LIVE") == "TRUE"
    return {
        "client": client,
        "data": entity_data,
        "idmap": idmap_resolved,
        "env": env,
        "explain": env.get("CHECKLYHQ_TEST_EXPLAIN") == "TRUE",
        "live": _live,
        "synthetic_only": _live and not _idmap_overridden,
        "now": int(time.time() * 1000),
    }
