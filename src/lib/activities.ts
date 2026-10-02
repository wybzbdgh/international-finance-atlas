export type RepoBalance = { securities: number; cash: number; repoDebt: number; bridgeDebt: number; haircut: number }
export const initialRepoBalance: RepoBalance = { securities: 100, cash: 0, repoDebt: 95, bridgeDebt: 0, haircut: 0.05 }

export function repoPosition(state: RepoBalance) {
  const capacity = state.securities * (1 - state.haircut)
  return { capacity, gap: Math.max(0, state.repoDebt - capacity), equity: state.securities + state.cash - state.repoDebt - state.bridgeDebt }
}

export function sellSecurities(state: RepoBalance, amount = 10, discount = 0.2): RepoBalance {
  const sold = Math.min(state.securities, Math.max(0, amount))
  return { ...state, securities: state.securities - sold, cash: state.cash + sold * (1 - discount) }
}

export function repayRepo(state: RepoBalance): RepoBalance {
  const paid = Math.min(state.cash, repoPosition(state).gap)
  return { ...state, cash: state.cash - paid, repoDebt: state.repoDebt - paid }
}

export type MonetaryConditions = { thirdParty: boolean; deepMarkets: boolean; liquidity: boolean; connected: boolean }
export function monetaryScenario(conditions: MonetaryConditions): 'A' | 'B' | 'C' {
  if (!conditions.thirdParty) return 'A'
  return conditions.connected ? 'B' : 'C'
}
export function completeRegionalCentre(conditions: MonetaryConditions) {
  return conditions.thirdParty && conditions.connected && conditions.deepMarkets && conditions.liquidity
}
