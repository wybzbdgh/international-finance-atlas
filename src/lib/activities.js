export const initialRepoBalance = {
  securities: 100,
  cash: 0,
  repoDebt: 95,
  bridgeDebt: 0,
  haircut: 0.05,
};
export function repoPosition(state) {
  const capacity = state.securities * (1 - state.haircut);
  return {
    capacity,
    gap: Math.max(0, state.repoDebt - capacity),
    equity: state.securities + state.cash - state.repoDebt - state.bridgeDebt,
  };
}
export function sellSecurities(state, amount = 10, discount = 0.2) {
  const sold = Math.min(state.securities, Math.max(0, amount));
  return {
    ...state,
    securities: state.securities - sold,
    cash: state.cash + sold * (1 - discount),
  };
}
export function repayRepo(state) {
  const paid = Math.min(state.cash, repoPosition(state).gap);
  return {
    ...state,
    cash: state.cash - paid,
    repoDebt: state.repoDebt - paid,
  };
}
export function monetaryScenario(conditions) {
  if (!conditions.thirdParty) return "A";
  return conditions.connected ? "B" : "C";
}
export function completeRegionalCentre(conditions) {
  return (
    conditions.thirdParty &&
    conditions.connected &&
    conditions.deepMarkets &&
    conditions.liquidity
  );
}
