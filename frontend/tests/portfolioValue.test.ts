import historyJson from "../src/data/mock-history.json";
import portfoliosJson from "../src/data/mock-portfolios.json";

import type { HistoryPoint } from "../src/services/portfolio/portfolioService";

function calcPortfolioValue(
  p: HistoryPoint,
  amounts: Record<string, number>
) {
  let total = 0;
  for (const [symbol, amount] of Object.entries(amounts)) {
    total += (p.prices[symbol] ?? 0) * amount;
  }
  return total;
}

describe("Portfolio value calculation", () => {
  const history = historyJson as unknown as HistoryPoint[];
  const profiles = (portfoliosJson as any).profiles;

  it("calculates portfolio value for conservative profile", () => {
    const profile = profiles.find((p: any) => p.id === "conservative");
    const last = history[history.length - 1];

    const value = calcPortfolioValue(last, profile.assets);

    expect(value).toBeGreaterThan(0);
    expect(Number.isFinite(value)).toBe(true);
  });

  it("different profiles produce different portfolio values", () => {
    const last = history[history.length - 1];

    const conservative = profiles.find(
      (p: any) => p.id === "conservative"
    );
    const aggressive = profiles.find(
      (p: any) => p.id === "aggressive"
    );

    const v1 = calcPortfolioValue(last, conservative.assets);
    const v2 = calcPortfolioValue(last, aggressive.assets);

    expect(v1).not.toBe(v2);
  });

  it("portfolio value reacts to history changes over time", () => {
    const profile = profiles.find((p: any) => p.id === "balanced");

    const first = history[0];
    const last = history[history.length - 1];

    const vStart = calcPortfolioValue(first, profile.assets);
    const vEnd = calcPortfolioValue(last, profile.assets);

    expect(vStart).not.toBe(vEnd);
  });
});
