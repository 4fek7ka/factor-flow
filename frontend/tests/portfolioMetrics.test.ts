import historyJson from "../src/data/mock-history.json";
import portfoliosJson from "../src/data/mock-portfolios.json";

import {
  buildTopMetrics,
} from "../src/services/portfolio/portfolioService";

import type { HistoryPoint } from "../src/services/portfolio/portfolioService";

describe("Portfolio metrics", () => {
  const history = historyJson as unknown as HistoryPoint[];
  const profiles = (portfoliosJson as any).profiles;

  it("builds metrics without NaN or Infinity", () => {
    const profile = profiles[0];
    const metrics = buildTopMetrics(history, profile.assets, "BTC");

    expect(Number.isFinite(metrics.tvl)).toBe(true);
    expect(Number.isFinite(metrics.changeUsd)).toBe(true);
    expect(Number.isFinite(metrics.changePct)).toBe(true);
  });

  it("metrics change when profile changes", () => {
    const p1 = profiles.find((p: any) => p.id === "conservative");
    const p2 = profiles.find((p: any) => p.id === "aggressive");

    const m1 = buildTopMetrics(history, p1.assets, "BTC");
    const m2 = buildTopMetrics(history, p2.assets, "BTC");

    expect(m1.tvl).not.toBe(m2.tvl);
  });

  it("vs BTC metric is finite", () => {
    const profile = profiles[1];
    const metrics = buildTopMetrics(history, profile.assets, "BTC");

    expect(Number.isFinite(metrics.vsBtcPp)).toBe(true);
  });
});
