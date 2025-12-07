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
  const timestamps = history.map((p) => new Date(p.timestamp * 1000));

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

  const base = values[0];
  const percentValues = values.map((v) => ((v - base) / base) * 100);

  return { timestamps, percentValues };
}
