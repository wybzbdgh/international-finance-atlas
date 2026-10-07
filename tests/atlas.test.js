import { test } from "node:test";
import assert from "node:assert/strict";
import {
  convertedAmount,
  monthsBefore,
  nearestDateIndex,
  normalizeComparison,
  pairSeries,
  replayTicks,
  shiftDate,
  snapshotFromRows,
} from "../src/lib/atlas-models.js";
import {
  currencyAt,
  currencyEpochStart,
  regimeByIso,
  regimeClasses,
} from "../src/map-data.js";
import { crossRate } from "../src/lib/fx.js";
const row = (date, quote, rate) => ({
  date,
  base: "USD",
  quote,
  rate,
});
const close = (a, b) =>
  assert.ok(Math.abs(a - b) < 1e-9, a + " differs from " + b);
test("comparison uses one common baseline and exactly shared observation dates", () => {
  const rows = [
    row("2026-01-01", "CNY", 7),
    row("2026-01-02", "CNY", 8),
    row("2026-01-03", "CNY", 6),
    row("2026-01-04", "CNY", 7),
    row("2026-01-02", "JPY", 140),
    row("2026-01-04", "JPY", 120),
  ];
  const result = normalizeComparison(rows, ["CNY", "JPY", "CNY", "CHF"], "USD");
  assert.equal(result.start, "2026-01-02");
  assert.equal(result.end, "2026-01-04");
  assert.deepEqual(result.missing, ["CHF"]);
  assert.deepEqual(
    result.series.map((s) => s.code),
    ["CNY", "JPY"],
  );
  for (const s of result.series) {
    assert.deepEqual(
      s.points.map((p) => p.date),
      ["2026-01-02", "2026-01-04"],
    );
    close(s.points[0].value, 100);
  }
  close(result.series[0].points[1].value, (8 / 7) * 100);
  close(result.series[1].points[1].value, (140 / 120) * 100);
});
test("comparison never forward fills or uses different-day currency legs", () => {
  const rows = [
    row("2026-01-01", "CNY", 7),
    row("2026-01-02", "CNY", 6),
    row("2026-01-02", "JPY", 150),
    row("2026-01-03", "JPY", 140),
  ];
  assert.deepEqual(pairSeries(rows, "CNY", "JPY"), [
    {
      date: "2026-01-02",
      value: 25,
    },
  ]);
  assert.equal(
    normalizeComparison(rows, ["CNY", "JPY"], "USD").series.length,
    0,
  );
});
test("USD self-series is constant and inverse currency series multiply to one", () => {
  const rows = [row("2026-01-01", "CNY", 7), row("2026-01-02", "CNY", 6.9)];
  const a = pairSeries(rows, "CNY", "USD"),
    b = pairSeries(rows, "USD", "CNY");
  a.forEach((point, i) => close(point.value * b[i].value, 1));
  assert.deepEqual(
    pairSeries(rows, "USD", "USD").map((p) => p.value),
    [1, 1],
  );
  assert.deepEqual(
    normalizeComparison(rows, ["USD"], "USD").series[0].points.map(
      (p) => p.value,
    ),
    [100, 100],
  );
});
test("snapshot retains currency observation dates and rejects invalid or non-USD quotes", () => {
  const result = snapshotFromRows([
    row("2026-01-02", "CNY", 6.9),
    row("2026-01-01", "CNY", 7),
    row("2026-01-01", "JPY", 150),
    row("2026-01-01", "CHF", -1),
    {
      ...row("2026-01-03", "CNY", 10),
      base: "EUR",
    },
  ]);
  assert.deepEqual(result.values, {
    USD: 1,
    CNY: 6.9,
    JPY: 150,
  });
  assert.deepEqual(result.dates, {
    CNY: "2026-01-02",
    JPY: "2026-01-01",
  });
});
test("replay ticks remain ordered through leap dates and month ends", () => {
  assert.equal(monthsBefore("2024-03-31", 1), "2024-02-29");
  assert.equal(monthsBefore("2025-03-31", 1), "2025-02-28");
  assert.equal(shiftDate("2024-03-01", -1), "2024-02-29");
  for (const range of ["year", "five", "since2008"]) {
    const dates = replayTicks("2026-10-03", range);
    assert.equal(dates.at(-1), "2026-10-03");
    assert.ok(dates.every((date, i) => !i || date > dates[i - 1]));
    assert.equal(nearestDateIndex(dates, "2026-10-03"), dates.length - 1);
  }
});
test("dated currency mapping separates predecessor and successor units", () => {
  for (const [iso, before, after, date] of [
    ["BGR", "BGN", "EUR", "2026-01-01"],
    ["HRV", "HRK", "EUR", "2023-01-01"],
    ["CUW", "ANG", "XCG", "2025-03-31"],
    ["SLE", "SLL", "SLE", "2022-07-01"],
  ]) {
    const country = {
      iso,
      currency: after,
    };
    assert.equal(currencyAt(country, shiftDate(date, -1)), before);
    assert.equal(currencyAt(country, date), after);
  }
  assert.equal(
    currencyAt(
      {
        iso: "ZWE",
        currency: "BWP",
      },
      "2026-10-03",
    ),
    "ZWG",
  );
  assert.equal(
    currencyAt(
      {
        iso: "SSD",
        currency: "SSP",
      },
      "2008-01-01",
    ),
    null,
  );
  assert.notEqual(
    currencyEpochStart(
      {
        iso: "VEN",
        currency: "VES",
      },
      "2021-09-30",
    ),
    currencyEpochStart(
      {
        iso: "VEN",
        currency: "VES",
      },
      "2021-10-01",
    ),
  );
});
test("a currency-adoption date cannot inherit the earlier country series", () => {
  const rows = [
    row("2025-12-31", "EUR", 0.9),
    row("2026-01-02", "EUR", 0.8),
    row("2026-01-05", "EUR", 0.85),
  ];
  const result = normalizeComparison(rows, ["EUR"], "USD", {
    EUR: "2026-01-01",
  });
  assert.equal(result.start, "2026-01-02");
  assert.equal(result.series[0].points[0].value, 100);
});
test("regime transcription has unique ISO entries and dated table exceptions", () => {
  const isos = Object.values(regimeClasses).flatMap((item) =>
    item.isos.split(" "),
  );
  assert.equal(isos.length, 196);
  assert.equal(new Set(isos).size, 196);
  assert.equal(regimeByIso.BGR.key, "board");
  assert.equal(regimeByIso.CHN.key, "crawl-like");
  assert.equal(regimeByIso.USA.key, "free");
  assert.equal(regimeByIso.HKG.key, "board");
  assert.equal(regimeByIso.AFG.date, "2021-04-30");
  assert.equal(regimeByIso.SYR.date, "2017-04-30");
  assert.equal(regimeByIso.ATA, undefined);
});
test("amount conversion preserves cross-rate units and rejects missing or invalid input", () => {
  const rate = crossRate(
    {
      USD: 1,
      CNY: 7,
      JPY: 140,
    },
    "CNY",
    "JPY",
  );
  assert.equal(convertedAmount("1000", rate), 20000);
  assert.equal(convertedAmount("0", rate), 0);
  for (const invalid of ["", " ", "-1", "abc", "Infinity", "1000000000001"])
    assert.equal(convertedAmount(invalid, rate), undefined);
  assert.equal(convertedAmount("100", undefined), undefined);
});
