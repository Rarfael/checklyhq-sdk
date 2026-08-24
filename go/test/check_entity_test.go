package sdktest

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"

	sdk "github.com/voxgig-sdk/checklyhq-sdk/go"
	"github.com/voxgig-sdk/checklyhq-sdk/go/core"

	vs "github.com/voxgig-sdk/checklyhq-sdk/go/utility/struct"
)

func TestCheckEntity(t *testing.T) {
	t.Run("instance", func(t *testing.T) {
		testsdk := sdk.TestSDK(nil, nil)
		ent := testsdk.Check(nil)
		if ent == nil {
			t.Fatal("expected non-nil CheckEntity")
		}
	})

	// Feature #4: the entity Stream(action, ...) method runs the op pipeline and
	// returns a channel over result items. With the streaming feature active it
	// yields the feature's incremental output; otherwise it falls back to the
	// materialised list so Stream always yields.
	t.Run("stream", func(t *testing.T) {
		seed := map[string]any{
			"entity": map[string]any{
				"check": map[string]any{
					"s1": map[string]any{"id": "s1"},
					"s2": map[string]any{"id": "s2"},
					"s3": map[string]any{"id": "s3"},
				},
			},
		}

		// Fallback: streaming inactive -> yields the materialised list items.
		base := sdk.TestSDK(seed, nil)
		var seen []any
		for item := range base.Check(nil).Stream("list", nil, nil) {
			seen = append(seen, item)
		}
		if len(seen) != 3 {
			t.Fatalf("expected 3 streamed items, got %d", len(seen))
		}

		// Inbound: streaming active -> yields each item from the feature iterator.
		hasStreaming := false
		if fm, ok := core.SharedConfig()["feature"].(map[string]any); ok {
			_, hasStreaming = fm["streaming"]
		}
		if hasStreaming {
			streamSdk := sdk.TestSDK(seed, map[string]any{
				"feature": map[string]any{"streaming": map[string]any{"active": true}},
			})
			var got []any
			for item := range streamSdk.Check(nil).Stream("list", nil, nil) {
				if sub, ok := item.([]any); ok {
					got = append(got, sub...)
				} else {
					got = append(got, item)
				}
			}
			if len(got) != 3 {
				t.Fatalf("expected 3 items via streaming feature, got %d", len(got))
			}
		}
	})

	t.Run("basic", func(t *testing.T) {
		setup := checkBasicSetup(nil)
		// Per-op sdk-test-control.json skip — basic test exercises a flow
		// with multiple ops; skipping any op skips the whole flow.
		_mode := "unit"
		if setup.live {
			_mode = "live"
		}
		for _, _op := range []string{"create", "list", "update", "load", "remove"} {
			if _shouldSkip, _reason := isControlSkipped("entityOp", "check." + _op, _mode); _shouldSkip {
				if _reason == "" {
					_reason = "skipped via sdk-test-control.json"
				}
				t.Skip(_reason)
				return
			}
		}
		// The basic flow consumes synthetic IDs from the fixture. In live mode
		// without an *_ENTID env override, those IDs hit the live API and 4xx.
		if setup.syntheticOnly {
			t.Skip("live entity test uses synthetic IDs from fixture — set CHECKLYHQ_TEST_CHECK_ENTID JSON to run live")
			return
		}
		client := setup.client

		// CREATE
		checkRef01Ent := client.Check(nil)
		checkRef01Data := core.ToMapAny(vs.GetProp(
			vs.GetPath([]any{"new", "check"}, setup.data), "check_ref01"))

		checkRef01DataResult, err := checkRef01Ent.Create(checkRef01Data, nil)
		if err != nil {
			t.Fatalf("create failed: %v", err)
		}
		checkRef01Data = core.ToMapAny(entityData(checkRef01DataResult))
		if checkRef01Data == nil {
			t.Fatal("expected create result to be a map")
		}
		if checkRef01Data["id"] == nil {
			t.Fatal("expected created entity to have an id")
		}

		// LIST
		checkRef01Match := map[string]any{}

		checkRef01ListResult, err := checkRef01Ent.List(checkRef01Match, nil)
		if err != nil {
			t.Fatalf("list failed: %v", err)
		}
		checkRef01List, checkRef01ListOk := checkRef01ListResult.([]any)
		if !checkRef01ListOk {
			t.Fatalf("expected list result to be an array, got %T", checkRef01ListResult)
		}

		foundItem := vs.Select(entityListToData(checkRef01List), map[string]any{"id": checkRef01Data["id"]})
		if vs.IsEmpty(foundItem) {
			t.Fatal("expected to find created entity in list")
		}

		// UPDATE
		checkRef01DataUp0Up := map[string]any{
			"id": checkRef01Data["id"],
		}

		checkRef01MarkdefUp0Name := "checkType"
		checkRef01MarkdefUp0Value := fmt.Sprintf("Mark01-check_ref01_%d", setup.now)
		checkRef01DataUp0Up[checkRef01MarkdefUp0Name] = checkRef01MarkdefUp0Value

		checkRef01ResdataUp0Result, err := checkRef01Ent.Update(checkRef01DataUp0Up, nil)
		if err != nil {
			t.Fatalf("update failed: %v", err)
		}
		checkRef01ResdataUp0 := core.ToMapAny(entityData(checkRef01ResdataUp0Result))
		if checkRef01ResdataUp0 == nil {
			t.Fatal("expected update result to be a map")
		}
		if checkRef01ResdataUp0["id"] != checkRef01DataUp0Up["id"] {
			t.Fatal("expected update result id to match")
		}
		if checkRef01ResdataUp0[checkRef01MarkdefUp0Name] != checkRef01MarkdefUp0Value {
			t.Fatalf("expected %s to be updated, got %v", checkRef01MarkdefUp0Name, checkRef01ResdataUp0[checkRef01MarkdefUp0Name])
		}

		// LOAD
		checkRef01MatchDt0 := map[string]any{
			"id": checkRef01Data["id"],
		}
		checkRef01DataDt0Loaded, err := checkRef01Ent.Load(checkRef01MatchDt0, nil)
		if err != nil {
			t.Fatalf("load failed: %v", err)
		}
		checkRef01DataDt0LoadResult := core.ToMapAny(entityData(checkRef01DataDt0Loaded))
		if checkRef01DataDt0LoadResult == nil {
			t.Fatal("expected load result to be a map")
		}
		if checkRef01DataDt0LoadResult["id"] != checkRef01Data["id"] {
			t.Fatal("expected load result id to match")
		}

		// REMOVE
		checkRef01MatchRm0 := map[string]any{
			"id": checkRef01Data["id"],
		}
		_, err = checkRef01Ent.Remove(checkRef01MatchRm0, nil)
		if err != nil {
			t.Fatalf("remove failed: %v", err)
		}

		// LIST
		checkRef01MatchRt0 := map[string]any{}

		checkRef01ListRt0Result, err := checkRef01Ent.List(checkRef01MatchRt0, nil)
		if err != nil {
			t.Fatalf("list failed: %v", err)
		}
		checkRef01ListRt0, checkRef01ListRt0Ok := checkRef01ListRt0Result.([]any)
		if !checkRef01ListRt0Ok {
			t.Fatalf("expected list result to be an array, got %T", checkRef01ListRt0Result)
		}

		notFoundItem := vs.Select(entityListToData(checkRef01ListRt0), map[string]any{"id": checkRef01Data["id"]})
		if !vs.IsEmpty(notFoundItem) {
			t.Fatal("expected removed entity to not be in list")
		}

	})
}

func checkBasicSetup(extra map[string]any) *entityTestSetup {
	loadEnvLocal()

	_, filename, _, _ := runtime.Caller(0)
	dir := filepath.Dir(filename)

	entityDataFile := filepath.Join(dir, "..", "..", ".sdk", "test", "entity", "check", "CheckTestData.json")

	entityDataSource, err := os.ReadFile(entityDataFile)
	if err != nil {
		panic("failed to read check test data: " + err.Error())
	}

	var entityData map[string]any
	if err := json.Unmarshal(entityDataSource, &entityData); err != nil {
		panic("failed to parse check test data: " + err.Error())
	}

	options := map[string]any{}
	options["entity"] = entityData["existing"]

	client := sdk.TestSDK(options, extra)

	// Generate idmap via transform, matching TS pattern.
	idmap := vs.Transform(
		[]any{"check01", "check02", "check03"},
		map[string]any{
			"`$PACK`": []any{"", map[string]any{
				"`$KEY`": "`$COPY`",
				"`$VAL`": []any{"`$FORMAT`", "upper", "`$COPY`"},
			}},
		},
	)

	// Detect ENTID env override before envOverride consumes it. When live
	// mode is on without a real override, the basic test runs against synthetic
	// IDs from the fixture and 4xx's. Surface this so the test can skip.
	entidEnvRaw := os.Getenv("CHECKLYHQ_TEST_CHECK_ENTID")
	idmapOverridden := entidEnvRaw != "" && strings.HasPrefix(strings.TrimSpace(entidEnvRaw), "{")

	env := envOverride(map[string]any{
		"CHECKLYHQ_TEST_CHECK_ENTID": idmap,
		"CHECKLYHQ_TEST_LIVE":      "FALSE",
		"CHECKLYHQ_TEST_EXPLAIN":   "FALSE",
		"CHECKLYHQ_APIKEY":         "NONE",
	})

	idmapResolved := core.ToMapAny(env["CHECKLYHQ_TEST_CHECK_ENTID"])
	if idmapResolved == nil {
		idmapResolved = core.ToMapAny(idmap)
	}

	if env["CHECKLYHQ_TEST_LIVE"] == "TRUE" {
		mergedOpts := vs.Merge([]any{
			map[string]any{
				"apikey": env["CHECKLYHQ_APIKEY"],
			},
			extra,
		})
		client = sdk.NewChecklyhqSDK(core.ToMapAny(mergedOpts))
	}

	live := env["CHECKLYHQ_TEST_LIVE"] == "TRUE"
	return &entityTestSetup{
		client:        client,
		data:          entityData,
		idmap:         idmapResolved,
		env:           env,
		explain:       env["CHECKLYHQ_TEST_EXPLAIN"] == "TRUE",
		live:          live,
		syntheticOnly: live && !idmapOverridden,
		now:           time.Now().UnixMilli(),
	}
}
