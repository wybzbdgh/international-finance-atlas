import { test } from "node:test";
import assert from "node:assert/strict";
import {
  dateOffset,
  dateRangeError,
  presetPeriod,
} from "../src/lib/date-range.js";
import { shiftDate } from "../src/lib/atlas-models.js";

test("presets use calendar months and always end today", () => {
  assert.deepEqual(presetPeriod("2024-03-31", 30), {
    from: "2024-02-29",
    to: "2024-03-31",
  });
  assert.deepEqual(presetPeriod("2026-10-07", 90), {
    from: "2026-07-07",
    to: "2026-10-07",
  });
  assert.deepEqual(presetPeriod("2024-02-29", 365), {
    from: "2023-02-28",
    to: "2024-02-29",
  });
  assert.deepEqual(presetPeriod("2024-02-29", 1826), {
    from: "2019-02-28",
    to: "2024-02-29",
  });
});

test("custom ranges accept the exact ten-year bounds and reject invalid dates", () => {
  const today = "2026-10-07";
  for (const [from, to] of [
    ["2016-10-07", today],
    ["2024-02-29", "2024-03-01"],
    ["2026-10-06", today],
  ])
    assert.equal(dateRangeError(from, to, today), "");
  for (const [from, to] of [
    ["2016-10-06", today],
    ["2016-10-07", "2026-10-08"],
    [today, today],
    [today, "2026-09-30"],
    ["2025-02-29", "2025-03-01"],
    ["2024-02-30", "2024-03-01"],
    ["2026-01-01", "2026-02-30"],
    ["2026-13-01", today],
    ["", today],
  ])
    assert.notEqual(dateRangeError(from, to, today), "", `${from} / ${to}`);
});

test("the date axis maps every day without daylight-saving or leap-year drift", () => {
  assert.equal(dateOffset("2024-02-28", "2024-03-01"), 2);
  assert.equal(dateOffset("2026-03-07", "2026-03-09"), 2);
  for (const date of ["2016-10-07", "2020-02-29", "2024-03-10", "2026-10-07"])
    assert.equal(shiftDate("2016-10-07", dateOffset("2016-10-07", date)), date);
});
