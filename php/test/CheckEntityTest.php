<?php
declare(strict_types=1);

// Check entity test

require_once __DIR__ . '/../checklyhq_sdk.php';
require_once __DIR__ . '/Runner.php';

use PHPUnit\Framework\TestCase;
use Voxgig\Struct\Struct as Vs;

class CheckEntityTest extends TestCase
{
    public function test_create_instance(): void
    {
        $testsdk = ChecklyhqSDK::test(null, null);
        $ent = $testsdk->Check(null);
        $this->assertNotNull($ent);
    }

    // Feature #4: the entity stream(action, ...) method runs the op pipeline
    // and yields result items. With the streaming feature active it yields the
    // feature's incremental output; otherwise it falls back to the materialised
    // list so stream always yields.
    public function test_stream(): void
    {
        $seed = [
            "entity" => [
                "check" => [
                    "s1" => ["id" => "s1"],
                    "s2" => ["id" => "s2"],
                    "s3" => ["id" => "s3"],
                ],
            ],
        ];

        // Fallback: streaming inactive -> yields the materialised list items.
        $base = ChecklyhqSDK::test($seed, null);
        $seen = iterator_to_array($base->Check(null)->stream("list", null, null), false);
        $this->assertCount(3, $seen);

        // Inbound: streaming active -> yields each item from the feature.
        $cfg = ChecklyhqConfig::shared_config();
        if (isset($cfg["feature"]) && is_array($cfg["feature"]) && isset($cfg["feature"]["streaming"])) {
            $sdk = ChecklyhqSDK::test($seed, ["feature" => ["streaming" => ["active" => true]]]);
            $got = [];
            foreach ($sdk->Check(null)->stream("list", null, null) as $item) {
                if (is_array($item) && array_is_list($item)) {
                    foreach ($item as $sub) {
                        $got[] = $sub;
                    }
                } else {
                    $got[] = $item;
                }
            }
            $this->assertCount(3, $got);
        }
    }

    public function test_basic_flow(): void
    {
        $setup = check_basic_setup(null);
        // Per-op sdk-test-control.json skip.
        $_live = !empty($setup["live"]);
        foreach (["create", "list", "update", "load", "remove"] as $_op) {
            [$_shouldSkip, $_reason] = Runner::is_control_skipped("entityOp", "check." . $_op, $_live ? "live" : "unit");
            if ($_shouldSkip) {
                $this->markTestSkipped($_reason ?? "skipped via sdk-test-control.json");
                return;
            }
        }
        // The basic flow consumes synthetic IDs from the fixture. In live mode
        // without an *_ENTID env override, those IDs hit the live API and 4xx.
        if (!empty($setup["synthetic_only"])) {
            $this->markTestSkipped("live entity test uses synthetic IDs from fixture — set CHECKLYHQ_TEST_CHECK_ENTID JSON to run live");
            return;
        }
        $client = $setup["client"];

        // CREATE
        $check_ref01_ent = $client->Check(null);
        $check_ref01_data = Helpers::to_map(Vs::getprop(
            Vs::getpath($setup["data"], "new.check"), "check_ref01"));

        $check_ref01_data_result = $check_ref01_ent->create($check_ref01_data, null);
        $check_ref01_data = Helpers::to_map(is_object($check_ref01_data_result) && method_exists($check_ref01_data_result, 'data_get') ? $check_ref01_data_result->data_get() : $check_ref01_data_result);
        $this->assertNotNull($check_ref01_data);
        $this->assertNotNull($check_ref01_data["id"]);

        // LIST
        $check_ref01_match = [];

        $check_ref01_list_result = $check_ref01_ent->list($check_ref01_match, null);
        $this->assertIsArray($check_ref01_list_result);

        $found_item = sdk_select(
            Runner::entity_list_to_data($check_ref01_list_result),
            ["id" => $check_ref01_data["id"]]);
        $this->assertNotEmpty($found_item);

        // UPDATE
        $check_ref01_data_up0_up = [
            "id" => $check_ref01_data["id"],
        ];

        $check_ref01_markdef_up0_name = "checkType";
        $check_ref01_markdef_up0_value = "Mark01-check_ref01_" . $setup["now"];
        $check_ref01_data_up0_up[$check_ref01_markdef_up0_name] = $check_ref01_markdef_up0_value;

        $check_ref01_resdata_up0_result = $check_ref01_ent->update($check_ref01_data_up0_up, null);
        $check_ref01_resdata_up0 = Helpers::to_map(is_object($check_ref01_resdata_up0_result) && method_exists($check_ref01_resdata_up0_result, 'data_get') ? $check_ref01_resdata_up0_result->data_get() : $check_ref01_resdata_up0_result);
        $this->assertNotNull($check_ref01_resdata_up0);
        $this->assertEquals($check_ref01_resdata_up0["id"], $check_ref01_data_up0_up["id"]);
        $this->assertEquals($check_ref01_resdata_up0[$check_ref01_markdef_up0_name], $check_ref01_markdef_up0_value);

        // LOAD
        $check_ref01_match_dt0 = [
            "id" => $check_ref01_data["id"],
        ];
        $check_ref01_data_dt0_loaded = $check_ref01_ent->load($check_ref01_match_dt0, null);
        $check_ref01_data_dt0_load_result = Helpers::to_map(is_object($check_ref01_data_dt0_loaded) && method_exists($check_ref01_data_dt0_loaded, 'data_get') ? $check_ref01_data_dt0_loaded->data_get() : $check_ref01_data_dt0_loaded);
        $this->assertNotNull($check_ref01_data_dt0_load_result);
        $this->assertEquals($check_ref01_data_dt0_load_result["id"], $check_ref01_data["id"]);

        // REMOVE
        $check_ref01_match_rm0 = [
            "id" => $check_ref01_data["id"],
        ];
        $check_ref01_ent->remove($check_ref01_match_rm0, null);

        // LIST
        $check_ref01_match_rt0 = [];

        $check_ref01_list_rt0_result = $check_ref01_ent->list($check_ref01_match_rt0, null);
        $this->assertIsArray($check_ref01_list_rt0_result);

        $not_found_item = sdk_select(
            Runner::entity_list_to_data($check_ref01_list_rt0_result),
            ["id" => $check_ref01_data["id"]]);
        $this->assertEmpty($not_found_item);

    }
}

function check_basic_setup($extra)
{
    Runner::load_env_local();

    $entity_data_file = __DIR__ . '/../../.sdk/test/entity/check/CheckTestData.json';
    $entity_data_source = file_get_contents($entity_data_file);
    $entity_data = json_decode($entity_data_source, true);

    $options = [];
    $options["entity"] = $entity_data["existing"];

    $client = ChecklyhqSDK::test($options, $extra);

    // Generate idmap.
    $idmap = [];
    foreach (["check01", "check02", "check03"] as $k) {
        $idmap[$k] = strtoupper($k);
    }

    // Detect ENTID env override before envOverride consumes it. When live
    // mode is on without a real override, the basic test runs against synthetic
    // IDs from the fixture and 4xx's. Surface this so the test can skip.
    $entid_env_raw = getenv("CHECKLYHQ_TEST_CHECK_ENTID");
    $idmap_overridden = $entid_env_raw !== false && str_starts_with(trim($entid_env_raw), "{");

    $env = Runner::env_override([
        "CHECKLYHQ_TEST_CHECK_ENTID" => $idmap,
        "CHECKLYHQ_TEST_LIVE" => "FALSE",
        "CHECKLYHQ_TEST_EXPLAIN" => "FALSE",
        "CHECKLYHQ_APIKEY" => "NONE",
    ]);

    $idmap_resolved = Helpers::to_map(
        $env["CHECKLYHQ_TEST_CHECK_ENTID"]);
    if ($idmap_resolved === null) {
        $idmap_resolved = Helpers::to_map($idmap);
    }

    if ($env["CHECKLYHQ_TEST_LIVE"] === "TRUE") {
        $merged_opts = Vs::merge([
            [
                "apikey" => $env["CHECKLYHQ_APIKEY"],
            ],
            $extra ?? [],
        ]);
        $client = new ChecklyhqSDK(Helpers::to_map($merged_opts));
    }

    $live = $env["CHECKLYHQ_TEST_LIVE"] === "TRUE";
    return [
        "client" => $client,
        "data" => $entity_data,
        "idmap" => $idmap_resolved,
        "env" => $env,
        "explain" => $env["CHECKLYHQ_TEST_EXPLAIN"] === "TRUE",
        "live" => $live,
        "synthetic_only" => $live && !$idmap_overridden,
        "now" => (int)(microtime(true) * 1000),
    ];
}
