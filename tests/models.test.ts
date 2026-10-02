import { test } from 'node:test'
import assert from 'node:assert/strict'
import { triangularArbitrage, parityForward, depositReturns, realExchangeRate, effectiveExchangeRates, overshootingPath, debtPath, firstYearFinancingNeed, bondPresentValue, hedgedLoanCost, exportHedge, stablecoinRedemption, iipReconciliation } from '../src/lib/models.ts'

const near = (actual: number, expected: number, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} differs from ${expected}`)

test('consistent cross quotes leave both triangular routes at par; spreads cost money', () => {
  const fair = triangularArbitrage(1.1, 7, 7.7, 0)
  near(fair.forward, 10000); near(fair.reverse, 10000)
  const spread = triangularArbitrage(1.1, 7, 7.7, 0.2)
  assert.ok(spread.forward < 10000 && spread.reverse < 10000)
  const dislocated = triangularArbitrage(1.1, 7, 7.85, 0)
  assert.ok(dislocated.forward > 10000 && dislocated.reverse < 10000)
})

test('CIP equalizes covered deposits and hedged loans for several interest-rate pairs', () => {
  for (const [home, foreign, years] of [[0.02, 0.05, 1], [0.08, 0, 0.25], [0, 0.08, 1]]) {
    const forward = parityForward(7, home, foreign, years)
    const deposits = depositReturns(10000, 7, home, foreign, years, forward, 8)
    near(deposits.covered, deposits.domestic)
    near(hedgedLoanCost(1000000, 7, foreign, forward, years).annualRate, home)
    assert.notEqual(deposits.uncovered, deposits.covered)
  }
})

test('real and effective rates use their stated opposite index directions', () => {
  near(realExchangeRate(7, 700, 100), 1)
  near(realExchangeRate(8, 700, 100), 8 / 7)
  const base = effectiveExchangeRates(7, 7.7, 0.6, 100, 100, 100)
  near(base.nominal, 100); near(base.real, 100)
  const depreciation = effectiveExchangeRates(8, 7.7, 1, 100, 100, 100)
  near(depreciation.nominal, 87.5)
  near(effectiveExchangeRates(7, 9, 1, 110, 100, 90).real, 110)
})

test('overshooting moves beyond the long-run level and converges monotonically', () => {
  const path = overshootingPath(7, 0.05, 0.3)
  near(path.impact, 7.7); near(path.longRun, 7.35)
  for (let i = 1; i < path.points.length; i++) assert.ok(path.points[i].y < path.points[i - 1].y && path.points[i].y > path.longRun)
  assert.ok(overshootingPath(7, 0, 0.3).points.every(point => point.y === 7))
})

test('a matching primary surplus stabilizes debt; paid debt does not become negative', () => {
  const stabilizingSurplus = (0.05 - 0.03) / 1.03 * 60
  assert.ok(debtPath(60, 0.05, 0.03, stabilizingSurplus).every(point => Math.abs(point.y - 60) < 1e-8))
  near(debtPath(100, 0.05, 0.03, 0)[1].y, 101.94174757281553)
  assert.ok(debtPath(20, 0, 0.1, 5).every(point => point.y >= 0))
  const low = firstYearFinancingNeed(60, 0.05, 0.03, 1, 0.2)
  const high = firstYearFinancingNeed(60, 0.05, 0.03, 1, 0.4)
  near(high - low, 0.2 * 60 / 1.03)
})

test('bonds trade at par when coupon equals discount rate; restructuring reduces PV', () => {
  near(bondPresentValue(100, 0.06, 5, 0.06), 100)
  const before = bondPresentValue(100, 0.06, 5, 0.08)
  assert.ok(bondPresentValue(80, 0.03, 8, 0.08) < before)
  near(bondPresentValue(100, 0, 1, 0.1), 100 / 1.1)
})

test('a full forward removes FX sensitivity; an option keeps upside after premium', () => {
  near(exportHedge(100000, 6.5, 6.95, 1, 'forward'), 695000)
  near(exportHedge(100000, 8, 6.95, 1, 'forward'), 695000)
  near(exportHedge(100000, 6.5, 6.95, 1, 'option', 0.08), 687000)
  near(exportHedge(100000, 8, 6.95, 1, 'option', 0.08), 792000)
  near(exportHedge(100000, 6.5, 6.95, 0, 'option', 0.08), 650000)
})

test('stablecoin payouts respect cash, sold assets and outstanding liabilities', () => {
  const allCash = stablecoinRedemption(100, 20, 100, 10)
  near(allCash.paid, 100); near(allCash.unfilled, 0); assert.equal(allCash.coverageAfter, null)
  const fireSale = stablecoinRedemption(20, 0, 30, 2)
  near(fireSale.paid, 30); assert.ok(fireSale.coverageAfter! < 1)
  const run = stablecoinRedemption(0, 20, 100, 10)
  near(run.paid, 72); near(run.unfilled, 28); near(run.assetsAfter, 0)
  for (const cash of [0, 20, 100]) for (const loss of [0, 20]) for (const redemption of [0, 30, 100]) for (const discount of [0, 10]) {
    const r = stablecoinRedemption(cash, loss, redemption, discount)
    assert.ok(r.paid >= 0 && r.paid <= redemption + 1e-8 && r.assetsAfter >= -1e-8)
    near(r.assetsBefore - r.assetsAfter - r.paid, r.bondsSold * (1 - loss / 100) * discount / 100)
    near(r.paid + r.remainingLiabilities, 100)
  }
})

test('IIP reconciles transactions and valuation independently', () => {
  for (const spot of [6, 7, 9]) for (const price of [-0.2, 0, 0.2]) for (const flow of [0, 20]) {
    const r = iipReconciliation(spot, price, flow)
    near(r.finalNet, r.initialNet + r.transaction + r.valuation)
  }
  near(iipReconciliation(8, 0, 0).valuation, 100)
  near(iipReconciliation(7, 0, 20).transaction, 140)
})
