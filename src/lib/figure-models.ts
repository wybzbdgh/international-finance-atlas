// Model illustrations use teaching parameters, separately from historical data.
export const sample = (min: number, max: number, fn: (x: number) => number, count = 61) =>
  Array.from({ length: count }, (_, n) => { const x = min + (max - min) * n / (count - 1); return { x, y: fn(x) } })

export function uipSpot(domesticPercent: number, foreignPercent: number, expectedSpot: number) {
  return expectedSpot * (1 + foreignPercent / 100) / (1 + domesticPercent / 100)
}
export function foreignReturn(spot: number, foreignPercent: number, expectedSpot: number) {
  return ((1 + foreignPercent / 100) * expectedSpot / spot - 1) * 100
}
export function relativePppPath(homeInflation: number, foreignInflation: number, spot = 7) {
  return sample(0, 10, year => spot * ((1 + homeInflation / 100) / (1 + foreignInflation / 100)) ** year, 11)
}

export function policyEquilibrium(regime: 'float' | 'fixed', instrument: 'money' | 'fiscal', strength: number, stage: 0 | 1 | 2 = 2) {
  // Local linearization: Y = 100 + F − 3(i−4) + 8(E−7),
  // LM: i = 4 + .12(Y−100) − M; UIP: i = 4 − 4(E−7).
  const fiscal = stage === 0 || instrument === 'money' ? 0 : strength
  let money = stage === 0 || instrument === 'fiscal' ? 0 : strength / 10
  let output: number, rate: number, spot: number
  if (regime === 'float') {
    output = 100 + (fiscal + 5 * money) / 1.6
    rate = 4 + .12 * (output - 100) - money
    spot = 7 - (rate - 4) / 4
  } else if (stage === 1) {
    // At the announced peg, goods/money clear first. FX is under pressure;
    // the UIP-implied rate is a counterfactual, never an observed peg change.
    output = 100 + (fiscal + 3 * money) / 1.36
    rate = 4 + .12 * (output - 100) - money
    spot = 7
  } else {
    output = 100 + fiscal
    rate = 4
    spot = 7
    money = .12 * fiscal
  }
  return { fiscal, money, output, rate, spot, pressureSpot: 7 - (rate - 4) / 4, isSlope: regime === 'float' ? 5 : 3 }
}

export function trancheLoss(totalLoss: number) {
  const loss = Math.max(0, Math.min(100, totalLoss))
  const junior = Math.min(5, loss)
  const mezzanine = Math.min(15, Math.max(0, loss - 5))
  const senior = Math.min(80, Math.max(0, loss - 20))
  return [
    { name: '优先层', face: 80, loss: senior, remaining: 80 - senior },
    { name: '夹层', face: 15, loss: mezzanine, remaining: 15 - mezzanine },
    { name: '劣后层', face: 5, loss: junior, remaining: 5 - junior },
  ]
}

export function riskSharing(foreignWeight: number) {
  const states = [[120, 120], [120, 80], [80, 120], [80, 80]]
  const consumption = states.map(([home, foreign]) => (1 - foreignWeight) * home + foreignWeight * foreign)
  const variance = consumption.reduce((sum, value) => sum + (value - 100) ** 2, 0) / 4
  return { consumption, variance }
}
