import { test } from "node:test";
import assert from "node:assert/strict";
import {
  triangularArbitrage,
  parityForward,
  depositReturns,
  realExchangeRate,
  effectiveExchangeRates,
  overshootingPath,
  debtPath,
  firstYearFinancingNeed,
  bondPresentValue,
  hedgedLoanCost,
  exportHedge,
  stablecoinRedemption,
  iipReconciliation,
} from "../src/lib/models.js";
import { crossRate, pairChange, sortHistory } from "../src/lib/fx.js";
import {
  completeRegionalCentre,
  initialRepoBalance,
  monetaryScenario,
  repayRepo,
  repoPosition,
  sellSecurities,
} from "../src/lib/activities.js";
import {
  foreignReturn,
  policyEquilibrium,
  relativePppPath,
  riskSharing,
  trancheLoss,
  uipSpot,
} from "../src/lib/figure-models.js";
const near = (actual, expected, tolerance = 1e-8) =>
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${actual} differs from ${expected}`,
  );
test("the UIP figure reproduces the lecture example and equal expected returns", () => {
  near(uipSpot(2, 5, 7.2), 7.411764705882353);
  for (const home of [0, 2, 10])
    for (const foreign of [0, 5, 10])
      for (const expected of [6.5, 7.2, 8]) {
        near(
          foreignReturn(uipSpot(home, foreign, expected), foreign, expected),
          home,
        );
      }
  assert.ok(uipSpot(5, 5, 7.2) < uipSpot(2, 5, 7.2));
});
test("relative PPP preserves the cross-country real-price relationship", () => {
  for (const [home, foreign] of [
    [6, 2],
    [-2, 10],
    [4, 4],
  ]) {
    for (const point of relativePppPath(home, foreign)) {
      near(
        (point.y * (1 + foreign / 100) ** point.x) /
          (1 + home / 100) ** point.x,
        7,
      );
    }
  }
});
test("linked policy diagrams satisfy all three markets at final equilibrium", () => {
  for (const regime of ["fixed", "float"])
    for (const instrument of ["money", "fiscal"])
      for (const strength of [0, 10, 20]) {
        const q = policyEquilibrium(regime, instrument, strength);
        near(q.output, 100 + q.fiscal - 3 * (q.rate - 4) + 8 * (q.spot - 7));
        near(q.rate, 4 + 0.12 * (q.output - 100) - q.money);
        near(q.rate, 4 - 4 * (q.spot - 7));
        if (regime === "fixed") {
          near(q.spot, 7);
          near(q.rate, 4);
        }
      }
  const before = policyEquilibrium("fixed", "money", 10, 1);
  assert.ok(before.rate < 4 && before.pressureSpot > 7);
  near(before.spot, 7);
  const after = policyEquilibrium("fixed", "money", 10, 2);
  near(after.money, 0);
  near(after.output, 100);
  const floatFiscal = policyEquilibrium("float", "fiscal", 10);
  const fixedFiscal = policyEquilibrium("fixed", "fiscal", 10);
  assert.ok(
    floatFiscal.output > 100 && floatFiscal.output < fixedFiscal.output,
  );
});
test("tranches preserve total loss and protect senior claims until junior layers exhaust", () => {
  for (const loss of [0, 4, 5, 12, 20, 21, 100]) {
    const tranches = trancheLoss(loss);
    near(
      tranches.reduce((s, t) => s + t.loss, 0),
      loss,
    );
    near(
      tranches.reduce((s, t) => s + t.remaining, 0),
      100 - loss,
    );
    assert.ok(tranches.every((t) => t.remaining >= 0 && t.remaining <= t.face));
  }
  assert.deepEqual(
    trancheLoss(12).map((t) => t.remaining),
    [80, 8, 0],
  );
  assert.deepEqual(
    trancheLoss(21).map((t) => t.remaining),
    [79, 0, 0],
  );
});
test("equal international asset sharing halves idiosyncratic consumption variance", () => {
  near(riskSharing(0).variance, 400);
  near(riskSharing(0.5).variance, 200);
  assert.deepEqual(riskSharing(0.5).consumption, [120, 100, 100, 80]);
  for (const weight of [0, 0.25, 0.5, 0.75, 1])
    near(riskSharing(weight).consumption.reduce((a, b) => a + b, 0) / 4, 100);
});
test("consistent cross quotes leave both triangular routes at par; spreads cost money", () => {
  const fair = triangularArbitrage(1.1, 7, 7.7, 0);
  near(fair.forward, 10000);
  near(fair.reverse, 10000);
  const spread = triangularArbitrage(1.1, 7, 7.7, 0.2);
  assert.ok(spread.forward < 10000 && spread.reverse < 10000);
  const dislocated = triangularArbitrage(1.1, 7, 7.85, 0);
  assert.ok(dislocated.forward > 10000 && dislocated.reverse < 10000);
});
test("CIP equalizes covered deposits and hedged loans for several interest-rate pairs", () => {
  for (const [home, foreign, years] of [
    [0.02, 0.05, 1],
    [0.08, 0, 0.25],
    [0, 0.08, 1],
  ]) {
    const forward = parityForward(7, home, foreign, years);
    const deposits = depositReturns(10000, 7, home, foreign, years, forward, 8);
    near(deposits.covered, deposits.domestic);
    near(hedgedLoanCost(1000000, 7, foreign, forward, years).annualRate, home);
    assert.notEqual(deposits.uncovered, deposits.covered);
  }
});
test("real and effective rates use their stated opposite index directions", () => {
  near(realExchangeRate(7, 700, 100), 1);
  near(realExchangeRate(8, 700, 100), 8 / 7);
  const base = effectiveExchangeRates(7, 7.7, 0.6, 100, 100, 100);
  near(base.nominal, 100);
  near(base.real, 100);
  const depreciation = effectiveExchangeRates(8, 7.7, 1, 100, 100, 100);
  near(depreciation.nominal, 87.5);
  near(effectiveExchangeRates(7, 9, 1, 110, 100, 90).real, 110);
});
test("overshooting moves beyond the long-run level and converges monotonically", () => {
  const path = overshootingPath(7, 0.05, 0.3);
  near(path.impact, 7.7);
  near(path.longRun, 7.35);
  for (let i = 1; i < path.points.length; i++)
    assert.ok(
      path.points[i].y < path.points[i - 1].y &&
        path.points[i].y > path.longRun,
    );
  assert.ok(overshootingPath(7, 0, 0.3).points.every((point) => point.y === 7));
});
test("a matching primary surplus stabilizes debt; paid debt does not become negative", () => {
  const stabilizingSurplus = ((0.05 - 0.03) / 1.03) * 60;
  assert.ok(
    debtPath(60, 0.05, 0.03, stabilizingSurplus).every(
      (point) => Math.abs(point.y - 60) < 1e-8,
    ),
  );
  near(debtPath(100, 0.05, 0.03, 0)[1].y, 101.94174757281553);
  assert.ok(debtPath(20, 0, 0.1, 5).every((point) => point.y >= 0));
  const low = firstYearFinancingNeed(60, 0.05, 0.03, 1, 0.2);
  const high = firstYearFinancingNeed(60, 0.05, 0.03, 1, 0.4);
  near(high - low, (0.2 * 60) / 1.03);
});
test("bonds trade at par when coupon equals discount rate; restructuring reduces PV", () => {
  near(bondPresentValue(100, 0.06, 5, 0.06), 100);
  const before = bondPresentValue(100, 0.06, 5, 0.08);
  assert.ok(bondPresentValue(80, 0.03, 8, 0.08) < before);
  near(bondPresentValue(100, 0, 1, 0.1), 100 / 1.1);
});
test("a full forward removes FX sensitivity; an option keeps upside after premium", () => {
  near(exportHedge(100000, 6.5, 6.95, 1, "forward"), 695000);
  near(exportHedge(100000, 8, 6.95, 1, "forward"), 695000);
  near(exportHedge(100000, 6.5, 6.95, 1, "option", 0.08), 687000);
  near(exportHedge(100000, 8, 6.95, 1, "option", 0.08), 792000);
  near(exportHedge(100000, 6.5, 6.95, 0, "option", 0.08), 650000);
});
test("stablecoin payouts respect cash, sold assets and outstanding liabilities", () => {
  const allCash = stablecoinRedemption(100, 20, 100, 10);
  near(allCash.paid, 100);
  near(allCash.unfilled, 0);
  assert.equal(allCash.coverageAfter, null);
  const fireSale = stablecoinRedemption(20, 0, 30, 2);
  near(fireSale.paid, 30);
  assert.ok(fireSale.coverageAfter < 1);
  const run = stablecoinRedemption(0, 20, 100, 10);
  near(run.paid, 72);
  near(run.unfilled, 28);
  near(run.assetsAfter, 0);
  for (const cash of [0, 20, 100])
    for (const loss of [0, 20])
      for (const redemption of [0, 30, 100])
        for (const discount of [0, 10]) {
          const r = stablecoinRedemption(cash, loss, redemption, discount);
          assert.ok(
            r.paid >= 0 &&
              r.paid <= redemption + 1e-8 &&
              r.assetsAfter >= -1e-8,
          );
          near(
            r.assetsBefore - r.assetsAfter - r.paid,
            (r.bondsSold * (1 - loss / 100) * discount) / 100,
          );
          near(r.paid + r.remainingLiabilities, 100);
        }
});
test("IIP reconciles transactions and valuation independently", () => {
  for (const spot of [6, 7, 9])
    for (const price of [-0.2, 0, 0.2])
      for (const flow of [0, 20]) {
        const r = iipReconciliation(spot, price, flow);
        near(r.finalNet, r.initialNet + r.transaction + r.valuation);
      }
  near(iipReconciliation(8, 0, 0).valuation, 100);
  near(iipReconciliation(7, 0, 20).transaction, 140);
});
test("country-currency quotes are reciprocal and consistent along all three legs", () => {
  const snapshot = {
    USD: 1,
    CNY: 7,
    JPY: 140,
    EUR: 0.9,
  };
  near(crossRate(snapshot, "CNY", "USD"), 1 / 7);
  near(crossRate(snapshot, "JPY", "CNY"), 0.05);
  for (const a of Object.keys(snapshot))
    for (const b of Object.keys(snapshot)) {
      near(crossRate(snapshot, a, b) * crossRate(snapshot, b, a), 1);
      near(
        crossRate(snapshot, a, b) * crossRate(snapshot, b, "EUR"),
        crossRate(snapshot, a, "EUR"),
      );
    }
  near(crossRate({}, "JPY", "JPY"), 1);
  assert.equal(crossRate(snapshot, "UNKNOWN", "USD"), undefined);
  assert.equal(
    crossRate(
      {
        USD: 1,
        CNY: 0,
      },
      "CNY",
      "USD",
    ),
    undefined,
  );
  assert.equal(
    crossRate(
      {
        USD: 1,
        CNY: Infinity,
      },
      "CNY",
      "USD",
    ),
    undefined,
  );
});
test("pair appreciation uses both currencies rather than the USD leg alone", () => {
  const previous = {
    USD: 1,
    CNY: 7,
    JPY: 140,
  };
  const current = {
    USD: 1,
    CNY: 8,
    JPY: 160,
  };
  near(pairChange(current, previous, "CNY", "USD"), -12.5);
  near(pairChange(current, previous, "USD", "CNY"), 100 / 7);
  near(pairChange(current, previous, "JPY", "CNY"), 0);
  near(pairChange(current, previous, "CNY", "CNY"), 0);
  assert.equal(pairChange(current, {}, "CNY", "USD"), undefined);
});
test("a history cannot retain another pair or duplicate calendar dates", () => {
  const rows = sortHistory(
    [
      {
        date: "2026-10-02",
        base: "JPY",
        quote: "CNY",
        rate: 0.05,
      },
      {
        date: "2026-10-01",
        base: "JPY",
        quote: "CNY",
        rate: 0.06,
      },
      {
        date: "2026-10-01",
        base: "JPY",
        quote: "USD",
        rate: 0.007,
      },
      {
        date: "2026-10-02",
        base: "JPY",
        quote: "CNY",
        rate: 0.051,
      },
    ],
    "JPY",
    "CNY",
  );
  assert.deepEqual(
    rows.map((row) => row.date),
    ["2026-10-01", "2026-10-02"],
  );
  near(rows[1].rate, 0.051);
});
test("collateral sales lose equity and reduce capacity; bridge loans only replace funding", () => {
  const initial = {
    ...initialRepoBalance,
    haircut: 0.25,
  };
  near(repoPosition(initial).gap, 20);
  near(repoPosition(initial).equity, 5);
  const sold = sellSecurities(initial);
  near(sold.cash, 8);
  near(repoPosition(sold).equity, 3);
  near(repoPosition(sold).gap, 27.5);
  const paid = repayRepo(sold);
  near(paid.cash, 0);
  near(repoPosition(paid).gap, 19.5);
  near(repoPosition(paid).equity, 3);
  const bridge = repayRepo({
    ...initial,
    cash: 20,
    bridgeDebt: 20,
  });
  near(repoPosition(bridge).gap, 0);
  near(repoPosition(bridge).equity, 5);
  near(bridge.repoDebt + bridge.bridgeDebt, initial.repoDebt);
  for (const sale of [0, 10, 25, 100, 200]) {
    const result = sellSecurities(initial, sale);
    const soldValue = Math.min(sale, 100);
    near(repoPosition(result).equity, 5 - soldValue * 0.2);
    assert.ok(result.securities >= 0 && result.cash >= 0);
    near(repoPosition(repayRepo(result)).equity, repoPosition(result).equity);
  }
});
test("monetary scenarios distinguish a functional centre from a complete regional one", () => {
  for (const deepMarkets of [false, true])
    for (const liquidity of [false, true]) {
      assert.equal(
        monetaryScenario({
          thirdParty: false,
          connected: true,
          deepMarkets,
          liquidity,
        }),
        "A",
      );
      assert.equal(
        monetaryScenario({
          thirdParty: true,
          connected: false,
          deepMarkets,
          liquidity,
        }),
        "C",
      );
      assert.equal(
        monetaryScenario({
          thirdParty: true,
          connected: true,
          deepMarkets,
          liquidity,
        }),
        "B",
      );
      assert.equal(
        completeRegionalCentre({
          thirdParty: true,
          connected: true,
          deepMarkets,
          liquidity,
        }),
        deepMarkets && liquidity,
      );
    }
});
