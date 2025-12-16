import historyJson from "../src/data/mock-history.json";
import portfoliosJson from "../src/data/mock-portfolios.json";

import {
  filterHistoryByPeriod,
} from "../src/services/portfolio/portfolioService";

import {
  estimatePortfolioParams,
} from "../src/services/portfolio/portfolioStatsService";

import type { HistoryPoint } from "../src/services/portfolio/portfolioService";

describe("Simulation parameter estimation", () => {
  const history = historyJson as unknown as HistoryPoint[];
  const profiles = (portfoliosJson as any).profiles;

  it("estimates drift and volatility for portfolio", () => {
    const profile = profiles[0];
    const filtered = filterHistoryByPeriod(history, "year");

    const { drift, volatility } = estimatePortfolioParams(
      filtered,
      profile.assets
    );

    expect(Number.isFinite(drift)).toBe(true);
    expect(Number.isFinite(volatility)).toBe(true);
    expect(volatility).toBeGreaterThan(0);
  });

  it("different profiles give different parameters", () => {
    const filtered = filterHistoryByPeriod(history, "year");

    const a = estimatePortfolioParams(
      filtered,
      profiles[0].assets
    );
    const b = estimatePortfolioParams(
      filtered,
      profiles[2].assets
    );

    expect(a.volatility).not.toBe(b.volatility);
  });
});
