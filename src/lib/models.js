// Rates are fractions, except for parameters explicitly named Percent.
// Teaching scenarios are separate from the map's daily reference rates.
export function triangularArbitrage(
  usdPerEur,
  cnyPerUsd,
  cnyPerEur,
  spreadPercent,
  startUsd = 10000,
) {
  const half = spreadPercent / 200;
  const bid = (p) => p * (1 - half);
  const ask = (p) => p * (1 + half);
  const euros = startUsd / ask(usdPerEur);
  const cny = euros * bid(cnyPerEur);
  const forward = cny / ask(cnyPerUsd);
  const reverse =
    ((startUsd * bid(cnyPerUsd)) / ask(cnyPerEur)) * bid(usdPerEur);
  return {
    euros,
    cny,
    forward,
    reverse,
    forwardProfit: forward - startUsd,
    reverseProfit: reverse - startUsd,
    cross: usdPerEur * cnyPerUsd,
  };
}
export function parityForward(spot, domesticRate, foreignRate, years) {
  return (spot * (1 + domesticRate * years)) / (1 + foreignRate * years);
}
export function depositReturns(
  principal,
  spot,
  domesticRate,
  foreignRate,
  years,
  forward,
  finalSpot,
) {
  const foreignBalance = (principal / spot) * (1 + foreignRate * years);
  return {
    domestic: principal * (1 + domesticRate * years),
    covered: foreignBalance * forward,
    uncovered: foreignBalance * finalSpot,
    foreignBalance,
  };
}
export function realExchangeRate(spot, domesticPrice, foreignPrice) {
  return (spot * foreignPrice) / domesticPrice;
}
export function effectiveExchangeRates(
  usdRate,
  eurRate,
  usdWeight,
  domesticIndex,
  usIndex,
  euIndex,
) {
  // CNY per foreign unit; appreciation raises effective indices.
  const nominal =
    100 * (7 / usdRate) ** usdWeight * (7.7 / eurRate) ** (1 - usdWeight);
  const foreignPriceIndex = usIndex ** usdWeight * euIndex ** (1 - usdWeight);
  return {
    nominal,
    real: (nominal * domesticIndex) / foreignPriceIndex,
  };
}
export function overshootingPath(
  initialSpot,
  monetaryChange,
  adjustment,
  periods = 12,
) {
  const longRun = initialSpot * (1 + monetaryChange);
  const impact = initialSpot * (1 + 2 * monetaryChange);
  return {
    longRun,
    impact,
    points: Array.from(
      {
        length: periods + 1,
      },
      (_, x) => ({
        x,
        y: longRun + (impact - longRun) * Math.exp(-adjustment * x),
      }),
    ),
  };
}
export function debtPath(
  initialRatioPercent,
  nominalRate,
  nominalGrowth,
  primarySurplusPercent,
  years = 10,
) {
  const result = [
    {
      x: 0,
      y: initialRatioPercent,
    },
  ];
  for (let x = 1; x <= years; x++)
    result.push({
      x,
      y: Math.max(
        0,
        ((1 + nominalRate) / (1 + nominalGrowth)) * result[x - 1].y -
          primarySurplusPercent,
      ),
    });
  return result;
}
export function firstYearFinancingNeed(
  initialRatioPercent,
  nominalRate,
  nominalGrowth,
  primarySurplusPercent,
  maturingFraction,
) {
  return (
    ((nominalRate + maturingFraction) * initialRatioPercent) /
      (1 + nominalGrowth) -
    primarySurplusPercent
  );
}
export function bondPresentValue(face, couponRate, years, discountRate) {
  let pv = 0;
  for (let t = 1; t <= years; t++)
    pv +=
      (face * couponRate + (t === years ? face : 0)) / (1 + discountRate) ** t;
  return pv;
}
export function hedgedLoanCost(
  principal,
  spot,
  foreignRate,
  forward,
  years,
  feePercent = 0,
) {
  const repayment =
    (principal / spot) * (1 + foreignRate * years) * forward +
    (principal * feePercent) / 100;
  return {
    repayment,
    annualRate: (repayment / principal - 1) / years,
  };
}
export function exportHedge(
  amountUsd,
  finalSpot,
  forward,
  ratio,
  method,
  premiumPerUsd = 0,
) {
  const hedgedRate =
    method === "forward"
      ? forward
      : Math.max(finalSpot, forward) - premiumPerUsd;
  return amountUsd * (ratio * hedgedRate + (1 - ratio) * finalSpot);
}
export function stablecoinRedemption(
  cashSharePercent,
  marketLossPercent,
  redemptionPercent,
  saleDiscountPercent,
  liabilities = 100,
) {
  const cash = (liabilities * cashSharePercent) / 100;
  const bonds = liabilities - cash;
  const price = 1 - marketLossPercent / 100;
  const salePrice = price * (1 - saleDiscountPercent / 100);
  const demand = (liabilities * redemptionPercent) / 100;
  const cashUsed = Math.min(cash, demand);
  const bondsSold = Math.min(bonds, Math.max(0, demand - cashUsed) / salePrice);
  const paid = cashUsed + bondsSold * salePrice;
  const assetsBefore = cash + bonds * price;
  const assetsAfter = cash - cashUsed + (bonds - bondsSold) * price;
  const remainingLiabilities = Math.max(0, liabilities - paid);
  return {
    cash,
    bonds,
    assetsBefore,
    cashUsed,
    bondsSold,
    paid,
    cashGap: Math.max(0, demand - cash),
    unfilled: Math.max(0, demand - paid),
    assetsAfter,
    remainingLiabilities,
    coverageAfter:
      remainingLiabilities > 1e-8 ? assetsAfter / remainingLiabilities : null,
  };
}
export function iipReconciliation(spot, assetPriceChange, netLendingUsd) {
  const initialAssetsUsd = 100,
    liabilitiesCny = 500,
    initialSpot = 7;
  const initialNet = initialAssetsUsd * initialSpot - liabilitiesCny;
  const transaction = netLendingUsd * spot;
  const valuation =
    initialAssetsUsd * ((1 + assetPriceChange) * spot - initialSpot);
  const finalAssets =
    (initialAssetsUsd * (1 + assetPriceChange) + netLendingUsd) * spot;
  return {
    initialNet,
    transaction,
    valuation,
    finalNet: finalAssets - liabilitiesCny,
    finalAssets,
    liabilitiesCny,
  };
}
