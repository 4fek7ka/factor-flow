type HistoryPoint = {
  timestamp: number;
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

export type Period = "year" | "month" | "week";

// ✅ ФИЛЬТРАЦИЯ ПО ПЕРИОДУ
export function filterHistoryByPeriod(
  history: HistoryPoint[],
  period: Period
) {
  if (!history.length) return history;

  const now = history[history.length - 1].timestamp * 1000;
  let from = now;

  if (period === "week") {
    from -= 7 * 24 * 60 * 60 * 1000;
  }

  if (period === "month") {
    from -= 30 * 24 * 60 * 60 * 1000;
  }

  if (period === "year") {
    from -= 365 * 24 * 60 * 60 * 1000;
  }

  return history.filter((p) => p.timestamp * 1000 >= from);
}

// ✅ РАСЧЁТ ПОРТФЕЛЯ
export function buildPortfolioSeries(
  history: HistoryPoint[],
  period: Period
) {
  const rawTimestamps = history.map((p) => p.timestamp * 1000);

  const values = history.map((p) => {
    const pr = p.prices;
    return (
      pr.ETH * AMOUNTS.ETH +
      pr.WBTC * AMOUNTS.WBTC +
      pr.USDC * AMOUNTS.USDC +
      pr.DAI * AMOUNTS.DAI +
      pr.UNI * AMOUNTS.UNI
    );
  });

  if (!values.length) {
    return { timestamps: [], percentValues: [] };
  }

  // ✅ ТВОЯ ЛОГИКА — ОТНОСИТЕЛЬНО ПЕРВОЙ ТОЧКИ
  const base = values[0];
  const rawPercentValues = values.map((v) => ((v - base) / base) * 100);

  // ✅ Year → с downsampling, Month/Week → без
  if (period === "year") {
    const timestamps: number[] = [];
    const percentValues: number[] = [];

    for (let i = 0; i < rawPercentValues.length; i += 2) {
      timestamps.push(rawTimestamps[i]);
      percentValues.push(rawPercentValues[i]);
    }

    return { timestamps, percentValues };
  }

  // ✅ Month + Week → ВСЕ точки
  return {
    timestamps: rawTimestamps,
    percentValues: rawPercentValues,
  };
}
