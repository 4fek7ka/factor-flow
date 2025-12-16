import type {
  AssetAmounts,
  HistoryPoint,
} from "./portfolioService";
import { calcPortfolioValue, DEFAULT_AMOUNTS } from "./portfolioService";

export type EstimatedParams = {
  drift: number; // μ — mean log-return per day
  volatility: number; // σ — std of log-returns per day
};

export function estimatePortfolioParams(
  history: HistoryPoint[],
  amounts: AssetAmounts = DEFAULT_AMOUNTS
): EstimatedParams {
  if (history.length < 2) {
    return { drift: 0, volatility: 0 };
  }

  const values: number[] = history
    .map((p) => calcPortfolioValue(p, amounts))
    .filter((v) => Number.isFinite(v) && v > 0);

  if (values.length < 2) {
    return { drift: 0, volatility: 0 };
  }

  // log-returns
  const returns: number[] = [];

  for (let i = 1; i < values.length; i++) {
    const r = Math.log(values[i] / values[i - 1]);
    if (Number.isFinite(r)) returns.push(r);
  }

  if (!returns.length) {
    return { drift: 0, volatility: 0 };
  }

  // mean (drift)
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;

  // std (volatility)
  const variance =
    returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;

  const std = Math.sqrt(variance);

  return {
    drift: mean,
    volatility: std,
  };
}
