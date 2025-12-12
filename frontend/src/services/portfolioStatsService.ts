import type { HistoryPoint } from "./portfolioService";

// те же веса, что и в Portfolio
const AMOUNTS = {
  ETH: 2,
  WBTC: 0.03,
  USDC: 80,
  DAI: 40,
  UNI: 400,
};

function calcPortfolioValue(p: HistoryPoint): number {
  const pr = p.prices;
  return (
    pr.ETH * AMOUNTS.ETH +
    pr.WBTC * AMOUNTS.WBTC +
    pr.USDC * AMOUNTS.USDC +
    pr.DAI * AMOUNTS.DAI +
    pr.UNI * AMOUNTS.UNI
  );
}

export type EstimatedParams = {
  drift: number;      // μ — mean log-return per day
  volatility: number; // σ — std of log-returns per day
};

export function estimatePortfolioParams(
  history: HistoryPoint[]
): EstimatedParams {
  if (history.length < 2) {
    return { drift: 0, volatility: 0 };
  }

  const values: number[] = history
    .map(calcPortfolioValue)
    .filter((v) => Number.isFinite(v) && v > 0);

  if (values.length < 2) {
    return { drift: 0, volatility: 0 };
  }

  // log-returns
  const returns: number[] = [];

  for (let i = 1; i < values.length; i++) {
    const r = Math.log(values[i] / values[i - 1]);
    if (Number.isFinite(r)) {
      returns.push(r);
    }
  }

  if (!returns.length) {
    return { drift: 0, volatility: 0 };
  }

  // mean (drift)
  const mean =
    returns.reduce((sum, r) => sum + r, 0) / returns.length;

  // std (volatility)
  const variance =
    returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) /
    returns.length;

  const std = Math.sqrt(variance);

  return {
    drift: mean,
    volatility: std,
  };
}
