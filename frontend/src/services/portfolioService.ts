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

export function buildPortfolioSeries(history: HistoryPoint[]) {
  // timestamps в ms
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

  // ✅ ТВОЯ ЛОГИКА — относительно первой точки
  const base = values[0];
  const rawPercentValues = values.map((v) => ((v - base) / base) * 100);

  // ✅ ТЕПЕРЬ БЕРЁМ КАЖДУЮ 3-Ю ТОЧКУ (пропускаем 2)
  const timestamps: number[] = [];
  const percentValues: number[] = [];

  for (let i = 0; i < rawPercentValues.length; i += 2) {
    timestamps.push(rawTimestamps[i]);
    percentValues.push(rawPercentValues[i]);
  }

  return { timestamps, percentValues };
}
