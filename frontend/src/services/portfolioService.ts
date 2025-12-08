export type Period = "year" | "month" | "week";

export type HistoryPoint = {
  timestamp: number; // unix seconds
  prices: {
    ETH: number;
    WBTC: number;
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

  const last = history[history.length - 1].timestamp;
  const seconds =
    period === "week" ? 7 * 24 * 3600 :
    period === "month" ? 30 * 24 * 3600 :
    365 * 24 * 3600;

  const cutoff = last - seconds;
  return history.filter((p) => p.timestamp >= cutoff);
}

/* ================================
   📌 Адаптивный downsampling
   ================================ */

function downsample(xs: number[], ys: number[], target: number) {
  const n = xs.length;
  if (n <= target) return { xs, ys };

  const step = Math.ceil(n / target);
  const outX = [];
  const outY = [];

  for (let i = 0; i < n; i += step) {
    outX.push(xs[i]);
    outY.push(ys[i]);
  }

  return { xs: outX, ys: outY };
}

/* ================================
   📌 Основная функция для графика
   ================================ */

export function buildPortfolioSeries(history: HistoryPoint[], period: Period) {
  const rawTimestamps = history.map((p) => p.timestamp * 1000);
  const values = history.map(calcPortfolioValue);

  if (!values.length) {
    return { timestamps: [], percentValues: [] };
  }

  const base = values[0];
  const rawPercentValues = values.map((v) =>
    base === 0 ? 0 : ((v - base) / base) * 100
  );

  // 🎯 Целевое число точек для графика
  const target =
    period === "week" ? 50 :
    period === "month" ? 70 :
    150; // year

  const { xs, ys } = downsample(rawTimestamps, rawPercentValues, target);

  return { timestamps: xs, percentValues: ys };
}

/* ================================
   📌 Метрики (без изменений)
   ================================ */

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
