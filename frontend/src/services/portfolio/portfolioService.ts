export type Period = "year" | "month" | "week";

export type AssetAmounts = Record<string, number>;

export type HistoryPoint = {
  timestamp: number; // unix seconds
  prices: Record<string, number>;
};

// fallback (если где-то не передали amounts)
export const DEFAULT_AMOUNTS: AssetAmounts = {
  ETH: 2,
  WBTC: 0.03,
  USDC: 80,
  DAI: 40,
  UNI: 400,
};

export function calcPortfolioValue(
  p: HistoryPoint,
  amounts: AssetAmounts = DEFAULT_AMOUNTS
): number {
  const pr = p.prices;
  let total = 0;

  for (const [sym, amount] of Object.entries(amounts)) {
    const price = pr[sym] ?? 0;
    total += price * amount;
  }

  return total;
}

export function filterHistoryByPeriod(history: HistoryPoint[], period: Period) {
  if (!history.length) return [];

  const last = history[history.length - 1].timestamp;
  const seconds =
    period === "week"
      ? 7 * 24 * 3600
      : period === "month"
      ? 30 * 24 * 3600
      : 365 * 24 * 3600;

  const cutoff = last - seconds;
  return history.filter((p) => p.timestamp >= cutoff);
}

/* ================================
   📌 Downsampling (visual)
================================ */

function downsample(xs: number[], ys: number[], target: number) {
  const n = xs.length;
  if (n <= target) return { xs, ys };

  const step = Math.ceil(n / target);
  const outX: number[] = [];
  const outY: number[] = [];

  for (let i = 0; i < n; i += step) {
    outX.push(xs[i]);
    outY.push(ys[i]);
  }

  // гарантируем последнюю точку
  if (outX[outX.length - 1] !== xs[n - 1]) {
    outX.push(xs[n - 1]);
    outY.push(ys[n - 1]);
  }

  return { xs: outX, ys: outY };
}

/* ================================
   ✅ Series
================================ */

export function buildPortfolioSeries(
  history: HistoryPoint[],
  period: Period,
  amounts: AssetAmounts = DEFAULT_AMOUNTS
) {
  const rawTimestamps = history.map((p) => p.timestamp * 1000);
  const values = history.map((p) => calcPortfolioValue(p, amounts));

  if (!values.length) {
    return { timestamps: [], percentValues: [] };
  }

  const base = values[0];
  const rawPercentValues = values.map((v) =>
    base === 0 ? 0 : ((v - base) / base) * 100
  );

  const target = period === "week" ? 50 : period === "month" ? 70 : 150;
  const { xs, ys } = downsample(rawTimestamps, rawPercentValues, target);

  return { timestamps: xs, percentValues: ys };
}

export function buildTopMetrics(
  history: HistoryPoint[],
  amounts: AssetAmounts = DEFAULT_AMOUNTS,
  btcSymbol: string = "BTC"
) {
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

  const startValue = calcPortfolioValue(first, amounts);
  const endValue = calcPortfolioValue(last, amounts);

  const changeUsd = endValue - startValue;
  const changePct = startValue === 0 ? 0 : (changeUsd / startValue) * 100;

  // BTC benchmark (если BTC нет — fallback на WBTC)
  const btcStart =
    first.prices[btcSymbol] ?? first.prices["WBTC"] ?? first.prices["BTC"] ?? 0;
  const btcEnd =
    last.prices[btcSymbol] ?? last.prices["WBTC"] ?? last.prices["BTC"] ?? 0;

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
