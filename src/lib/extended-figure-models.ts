// Teaching models. Percent arguments are in percentage points; values are not
// historical observations. Their accounting conventions are documented beside
// each figure and in docs/interactive-figures.md.
export function iipValuation(flow: number, depreciation: number, assetPrice: number, liabilityPrice: number) {
  const assets = 150, liabilities = 120, foreignAssets = .8, foreignLiabilities = .3
  const assetAfterPrice = assets * (1 + assetPrice / 100)
  const liabilityAfterPrice = liabilities * (1 + liabilityPrice / 100)
  const price = assetAfterPrice - liabilityAfterPrice - (assets - liabilities)
  const fx = depreciation / 100 * (assetAfterPrice * foreignAssets - liabilityAfterPrice * foreignLiabilities)
  const finalAssets = assetAfterPrice * (1 + foreignAssets * depreciation / 100) + flow
  const finalLiabilities = liabilityAfterPrice * (1 + foreignLiabilities * depreciation / 100)
  return { initial: assets - liabilities, price, fx, flow, final: finalAssets - finalLiabilities, finalAssets, finalLiabilities }
}

export function balassaSamuelson(tradableProductivity: number, serviceProductivity: number, serviceWeight = .5) {
  const wage = tradableProductivity
  const tradablePrice = 1
  const servicePrice = wage / serviceProductivity
  const price = tradablePrice ** (1 - serviceWeight) * servicePrice ** serviceWeight
  return { wage, tradablePrice, servicePrice, price, realExchangeRate: 1 / price }
}

export function coveredCashflow(homeRate: number, foreignRate: number, forward: number, futureSpot: number, costBps: number, spot = 7, principal = 100) {
  const cost = costBps / 10000
  const foreignPrincipal = principal / spot * (1 - cost)
  const foreignDeposit = foreignPrincipal * (1 + foreignRate / 100)
  const domestic = principal * (1 + homeRate / 100)
  const covered = foreignDeposit * forward * (1 - cost)
  const uncovered = foreignDeposit * futureSpot * (1 - cost)
  const parity = spot * (1 + homeRate / 100) / (1 + foreignRate / 100)
  return { domestic, covered, uncovered, foreignPrincipal, foreignDeposit, parity, lower: parity * (1 - cost) ** 2, upper: parity / (1 - cost) ** 2 }
}

export function jCurve(depreciation: number, exportElasticity: number, importElasticity: number, lagMonths: number, time: number) {
  const exchange = 1 + depreciation / 100
  const adjustment = 1 - Math.exp(-Math.max(0, time) / lagMonths)
  const exportVolume = 1 + adjustment * (exchange ** exportElasticity - 1)
  const importVolume = 1 + adjustment * (exchange ** -importElasticity - 1)
  const exports = 100 * exportVolume, imports = 100 * exchange * importVolume
  const longRun = 100 * (exchange ** exportElasticity - exchange ** (1 - importElasticity))
  return { exports, imports, balance: exports - imports, longRun, exportVolume, importVolume }
}

export function currencyMismatch(depreciation: number, debtForeignShare: number, hedgePercent: number) {
  const initialAssets = 100, initialDebt = 80, foreignAssets = 20
  const foreignDebt = initialDebt * debtForeignShare / 100
  const assetGain = foreignAssets * depreciation / 100
  const liabilityLoss = foreignDebt * depreciation / 100
  const hedgeGain = (foreignDebt - foreignAssets) * hedgePercent / 100 * depreciation / 100
  const assets = initialAssets + assetGain + hedgeGain, debt = initialDebt + liabilityLoss
  return { initialEquity: 20, equity: assets - debt, assets, debt, assetGain, liabilityLoss, hedgeGain, netExposure: foreignDebt - foreignAssets }
}

export function repoLiquidity(priceFall: number, haircutPercent: number, cash: number) {
  const initialCollateral = 100, debt = 90
  const collateral = initialCollateral * (1 - priceFall / 100), haircut = haircutPercent / 100
  const capacity = collateral * (1 - haircut)
  const marginCall = Math.max(0, debt - capacity)
  const cashUsed = Math.min(cash, marginCall)
  const uncovered = marginCall - cashUsed
  const requiredSale = uncovered <= 0 ? 0 : uncovered / haircut
  const sale = Math.min(collateral, requiredSale)
  const unresolved = Math.max(0, uncovered - haircut * sale)
  const remainingDebt = debt - cashUsed - sale
  const remainingCapacity = (collateral - sale) * (1 - haircut)
  return { collateral, debt, capacity, marginCall, cashUsed, requiredSale, sale, unresolved, remainingDebt, remainingCapacity, equity: collateral + cash - debt }
}

export function capitalMobility(regime: 'float' | 'fixed', instrument: 'money' | 'fiscal', strength: number, mobility: number, perfect = false) {
  // Deviations from Y=100, i=4%, E=7. IS: y=F−3r+8e;
  // LM: r=.12y−M; external balance: 0=−.1y+2e+κr.
  const fiscal = instrument === 'fiscal' ? strength : 0
  let money = instrument === 'money' ? strength / 10 : 0
  let output: number, rate: number, exchange: number
  if (regime === 'float') {
    if (perfect) { output = money / .12; rate = 0; exchange = (output - fiscal) / 8 }
    else {
      output = (fiscal + (3 + 4 * mobility) * money) / (.6 + .12 * (3 + 4 * mobility))
      rate = .12 * output - money
      exchange = (.1 * output - mobility * rate) / 2
    }
  } else {
    exchange = 0
    if (perfect) { output = fiscal; rate = 0 }
    else if (mobility === 0) { output = 0; rate = fiscal / 3 }
    else { output = fiscal / (1 + .3 / mobility); rate = .1 * output / mobility }
    money = .12 * output - rate
  }
  const netExports = -.1 * output + 2 * exchange
  return { output: 100 + output, rate: 4 + rate, exchange: 7 + exchange, fiscal, money, netExports, capitalInflow: perfect ? -netExports : mobility * rate }
}

export function moneyAdjustment(shockPercent: number, speed: number, semiElasticity: number, time: number, flexible = false) {
  // Log-linear money demand at fixed output: m−p=−λ(i−i*).
  // Price adjustment: ṗ=θ(m−p). UIP: ė=i−i*. Terminal PPP: e∞=p∞=m.
  // Closed-form stable path for an unanticipated permanent money-level shock.
  const m = Math.log1p(shockPercent / 100)
  if (time < 0) return { money: 100, price: 100, exchange: 7, rate: 4, logExchange: 0, exchangeVelocity: 0 }
  const residual = flexible ? 0 : Math.exp(-speed * time)
  const p = m * (1 - residual)
  const e = m + m / (semiElasticity * speed) * residual
  const interestGap = -m / semiElasticity * residual
  return { money: 100 * Math.exp(m), price: 100 * Math.exp(p), exchange: 7 * Math.exp(e), rate: 4 + 100 * interestGap, logExchange: e, exchangeVelocity: interestGap }
}

export function specieFlow(initialHomeMoney: number, tradeResponse: number, time: number) {
  // Two fixed-output economies, total specie 200, velocity 1 and Y=Y*=100.
  // Gold inflow = κ(P*−P), with P=M/100 and P*=(200−M)/100.
  const homeMoney = 100 + (initialHomeMoney - 100) * Math.exp(-tradeResponse * time / 50)
  const foreignMoney = 200 - homeMoney
  const homePrice = homeMoney / 100, foreignPrice = foreignMoney / 100
  const tradeBalance = tradeResponse * (foreignPrice - homePrice)
  return { homeMoney, foreignMoney, homePrice, foreignPrice, tradeBalance, relativePrice: homePrice / foreignPrice }
}

export function intertemporalChoice(ratePercent: number, borrowingLimit: number, chosenConsumption?: number) {
  const rate = ratePercent / 100, income1 = 60, income2 = 100
  const wealth = income1 + income2 / (1 + rate)
  const maxConsumption = Math.min(income1 + borrowingLimit, wealth - .01)
  const unconstrained = wealth / 2
  const optimal = Math.min(unconstrained, maxConsumption)
  const consumption1 = Math.max(.01, Math.min(chosenConsumption ?? optimal, maxConsumption))
  const assets1 = income1 - consumption1
  const interest2 = rate * assets1
  const consumption2 = income2 + (1 + rate) * assets1
  const currentAccount1 = assets1
  const currentAccount2 = income2 + interest2 - consumption2
  return { rate, income1, income2, wealth, maxConsumption, unconstrained, optimal, consumption1, consumption2, interest2, currentAccount1, currentAccount2, assets1, assets2: assets1 + currentAccount2, utility: Math.log(consumption1) + Math.log(consumption2), binding: unconstrained > maxConsumption }
}
