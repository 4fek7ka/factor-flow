export type Period = "year" | "month" | "week";

export type HistoryPoint = {
  timestamp: number; // unix seconds
  prices: {
    ETH: number;
    WBTC: number; // ✅ считаем как BTC (в UI называем BTC)
    USDC: number;
    DAI: number;
    UNI: number;
  };
};

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

export function filterHistoryByPeriod(history: HistoryPoint[], period: Period) {
  if (!history.length) return [];

  const last = history[history.length - 1].timestamp; // seconds
  const seconds =
    period === "week" ? 7 * 24 * 60 * 60 :
    period === "month" ? 30 * 24 * 60 * 60 :
    365 * 24 * 60 * 60;

  const cutoff = last - seconds;
  return history.filter((p) => p.timestamp >= cutoff);
}

/**
 * Данные для графика.
 * ВАЖНО: тут может быть downsampling для year, чтобы линия была "плавнее".
 */
export function buildPortfolioSeries(history: HistoryPoint[], period: Period) {
  const rawTimestamps = history.map((p) => p.timestamp * 1000); // ms

  const values = history.map(calcPortfolioValue);

  if (!values.length) {
    return { timestamps: [], percentValues: [] };
  }

  const base = values[0];
  const rawPercentValues = values.map((v) => (base === 0 ? 0 : ((v - base) / base) * 100));

  // ✅ Downsampling: только для year (как договаривались)
  if (period !== "year") {
    return { timestamps: rawTimestamps, percentValues: rawPercentValues };
  }

  const timestamps: number[] = [];
  const percentValues: number[] = [];

  for (let i = 0; i < rawPercentValues.length; i += 2) {
    timestamps.push(rawTimestamps[i]);
    percentValues.push(rawPercentValues[i]);
  }

  return { timestamps, percentValues };
}

/**
 * Метрики для карточек (без downsampling).
 * BTC берём из WBTC, но в UI называем BTC.
 */
export function buildTopMetrics(history: HistoryPoint[]) {
  if (history.length < 2) {
    return {
      tvl: 0,
      lastTsMs: 0,
      changeUsd: 0,
      changePct: 0,
      btcPct: 0,
      vsBtcPp: 0,
    };
  }

  const first = history[0];
  const last = history[history.length - 1];

  const startValue = calcPortfolioValue(first);
  const endValue = calcPortfolioValue(last);

  const changeUsd = endValue - startValue;
  const changePct = startValue === 0 ? 0 : (changeUsd / startValue) * 100;

  const btcStart = first.prices.WBTC;
  const btcEnd = last.prices.WBTC;
  const btcPct = btcStart === 0 ? 0 : ((btcEnd - btcStart) / btcStart) * 100;

  const vsBtcPp = changePct - btcPct;

  return {
    tvl: endValue,
    lastTsMs: last.timestamp * 1000,
    changeUsd,
    changePct,
    btcPct,
    vsBtcPp,
  };
}
