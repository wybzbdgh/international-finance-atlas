import { test } from 'node:test'
import assert from 'node:assert/strict'
import { balassaSamuelson, capitalMobility, coveredCashflow, currencyMismatch, iipValuation, intertemporalChoice, jCurve, moneyAdjustment, repoLiquidity, specieFlow } from '../src/lib/extended-figure-models.ts'

const near = (actual: number, expected: number, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} differs from ${expected}`)

test('IIP transaction and valuation contributions exactly reconcile the final balance sheet', () => {
  for (const flow of [-20, 0, 20]) for (const fx of [-20, 0, 30]) for (const asset of [-25, 25]) for (const liability of [-25, 25]) {
    const q = iipValuation(flow, fx, asset, liability)
    near(q.final, q.initial + q.flow + q.fx + q.price)
    near(q.final, q.finalAssets - q.finalLiabilities)
  }
  near(iipValuation(5, 0, 0, 0).final, 35)
  near(iipValuation(0, 10, 0, 0).fx, 8.4)
})

test('Balassa-Samuelson isolates relative sector productivity rather than common productivity growth', () => {
  for (const productivity of [.5, 1, 2.5]) for (const weight of [.1, .5, .8]) {
    const both = balassaSamuelson(productivity, productivity, weight)
    near(both.price, 1); near(both.realExchangeRate, 1)
    const tradable = balassaSamuelson(2, 1, weight)
    near(tradable.servicePrice, 2)
    near(tradable.price * tradable.realExchangeRate, 1)
    assert.ok(tradable.realExchangeRate < 1)
  }
})

test('CIP costs create two correct directional no-arbitrage boundaries', () => {
  for (const home of [0, 2, 8]) for (const foreign of [0, 5, 8]) for (const bps of [0, 10, 100]) {
    const q = coveredCashflow(home, foreign, 7, 7.2, bps)
    const upper = coveredCashflow(home, foreign, q.upper, 7.2, bps)
    near(upper.covered, upper.domestic)
    const reverseProceeds = 7 / q.lower * (1 + home / 100) * (1 - bps / 10000) ** 2
    near(reverseProceeds, 1 + foreign / 100)
    assert.ok(q.lower <= q.parity && q.parity <= q.upper)
  }
  const first = coveredCashflow(2, 5, 6.8, 6.5, 10), second = coveredCashflow(2, 5, 6.8, 7.8, 10)
  near(first.covered, second.covered); assert.ok(first.uncovered < second.uncovered)
})

test('J curve starts with the import-price effect and obeys Marshall-Lerner at the limit', () => {
  for (const depreciation of [0, 5, 30]) for (const exports of [.2, .5, 1, 2]) for (const imports of [.2, .5, 1, 2]) {
    const impact = jCurve(depreciation, exports, imports, 6, 0)
    near(impact.balance, -depreciation)
    const terminal = jCurve(depreciation, exports, imports, 6, 1000)
    near(terminal.balance, terminal.longRun)
    if (depreciation > 0) assert.equal(Math.sign(Number(terminal.longRun.toFixed(8))), Math.sign(exports + imports - 1))
  }
  assert.ok(jCurve(15, .8, .7, 3, 6).balance > jCurve(15, .8, .7, 12, 6).balance)
})

test('a fully hedged net FX exposure removes the exchange-rate effect on equity', () => {
  for (const depreciation of [-20, 0, 60]) for (const share of [0, 25, 80, 100]) {
    const q = currencyMismatch(depreciation, share, 100)
    near(q.equity, 20)
    near(q.equity, 20 + q.assetGain - q.liabilityLoss + q.hedgeGain)
  }
  assert.ok(currencyMismatch(20, 80, 0).equity < 20)
  assert.ok(currencyMismatch(20, 0, 0).equity > 20)
})

test('repo collateral sales respect the haircut feedback and preserve balance-sheet equity', () => {
  for (const fall of [0, 10, 35]) for (const haircut of [5, 25, 60]) for (const cash of [0, 5, 20]) {
    const q = repoLiquidity(fall, haircut, cash)
    near(q.collateral - q.sale + cash - q.cashUsed - q.remainingDebt, q.equity)
    near(Math.max(0, q.remainingDebt - q.remainingCapacity), q.unresolved)
    assert.ok(q.sale >= 0 && q.sale <= q.collateral)
    if (q.equity >= 0) near(q.unresolved, 0)
  }
  const q = repoLiquidity(10, 25, 5)
  near(q.marginCall, 22.5); near(q.sale, 70); near(q.remainingDebt, 15)
  assert.ok(repoLiquidity(35, 25, 5).unresolved > 0)
})

test('all capital-mobility equilibria satisfy goods, money and external balance', () => {
  for (const regime of ['float', 'fixed'] as const) for (const instrument of ['money', 'fiscal'] as const) for (const strength of [0, 10, 20]) for (const mobility of [0, .5, 3, 30]) for (const perfect of [false, true]) {
    const q = capitalMobility(regime, instrument, strength, mobility, perfect)
    near(q.output - 100, q.fiscal - 3 * (q.rate - 4) + 8 * (q.exchange - 7))
    near(q.rate - 4, .12 * (q.output - 100) - q.money)
    near(q.netExports + q.capitalInflow, 0)
    if (regime === 'fixed') near(q.exchange, 7)
    if (perfect) near(q.rate, 4)
  }
})

test('Mundell-Fleming perfect-mobility limits emerge continuously from finite mobility', () => {
  for (const regime of ['float', 'fixed'] as const) for (const instrument of ['money', 'fiscal'] as const) {
    const approximate = capitalMobility(regime, instrument, 10, 1e9)
    const limit = capitalMobility(regime, instrument, 10, 1, true)
    near(approximate.output, limit.output, 1e-6)
    near(approximate.exchange, limit.exchange, 1e-6)
  }
  near(capitalMobility('float', 'fiscal', 10, 1, true).output, 100)
  near(capitalMobility('fixed', 'money', 10, 1, true).output, 100)
  near(capitalMobility('fixed', 'fiscal', 10, 1, true).output, 110)
})

test('money, prices, interest and exchange rates jointly satisfy money demand and UIP', () => {
  const delta = .000001
  for (const shock of [0, 5, 20]) for (const speed of [.2, .6, 1.2]) for (const elasticity of [1, 2, 5]) for (const time of [0, 2, 12]) {
    const q = moneyAdjustment(shock, speed, elasticity, time)
    const m = Math.log(q.money / 100), p = Math.log(q.price / 100)
    near(m - p, -elasticity * (q.rate - 4) / 100)
    const next = moneyAdjustment(shock, speed, elasticity, time + delta)
    near((next.logExchange - q.logExchange) / delta, (q.rate - 4) / 100, 1e-6)
    near((Math.log(next.price / 100) - p) / delta, speed * (m - p), 1e-6)
  }
})

test('flexible prices eliminate overshooting while sticky prices approach the same long run', () => {
  for (const shock of [0, 10, 20]) {
    const sticky = moneyAdjustment(shock, .6, 2, 0)
    const flexible = moneyAdjustment(shock, .6, 2, 0, true)
    const terminal = moneyAdjustment(shock, .6, 2, 100)
    near(flexible.exchange, 7 * (1 + shock / 100)); near(flexible.rate, 4)
    near(terminal.exchange, flexible.exchange); near(terminal.price, flexible.price)
    if (shock > 0) assert.ok(sticky.exchange > flexible.exchange)
  }
})

test('specie flows conserve the world money stock and equal the home trade balance', () => {
  const delta = .000001
  for (const initial of [40, 100, 160]) for (const response of [0, 10, 30]) for (const time of [0, 5, 20]) {
    const q = specieFlow(initial, response, time)
    near(q.homeMoney + q.foreignMoney, 200)
    near(q.homePrice * 100, q.homeMoney)
    near(q.foreignPrice * 100, q.foreignMoney)
    near((specieFlow(initial, response, time + delta).homeMoney - q.homeMoney) / delta, q.tradeBalance, 2e-5)
    if (response === 0) near(q.homeMoney, initial)
  }
  near(specieFlow(140, 10, 200).homeMoney, 100)
  assert.ok(specieFlow(140, 10, 0).tradeBalance < 0)
  assert.ok(specieFlow(60, 10, 0).tradeBalance > 0)
})

test('two-period accounts include interest income and repay all foreign liabilities', () => {
  for (const rate of [0, 5, 15]) for (const limit of [0, 10, 40]) for (const choice of [undefined, 20, 70, 100]) {
    const q = intertemporalChoice(rate, limit, choice)
    near(q.consumption1 + q.consumption2 / (1 + q.rate), q.wealth)
    near(q.currentAccount1 + q.currentAccount2, 0)
    near(q.assets2, 0)
    near(q.currentAccount2, q.income2 + q.interest2 - q.consumption2)
    assert.ok(q.consumption1 <= q.income1 + limit)
    const optimum = intertemporalChoice(rate, limit)
    assert.ok(q.utility <= optimum.utility + 1e-10)
  }
})

test('the intertemporal Euler equation holds only when the borrowing constraint permits it', () => {
  for (const rate of [0, 5, 15]) {
    const free = intertemporalChoice(rate, 40)
    near(free.consumption2, (1 + free.rate) * free.consumption1)
    assert.equal(free.binding, false)
    const constrained = intertemporalChoice(rate, 0)
    near(constrained.consumption1, 60); near(constrained.consumption2, 100)
    assert.equal(constrained.binding, true)
  }
})
