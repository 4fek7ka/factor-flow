import { useMemo, useState } from "react";
import historyJson from "../data/mock-history.json";

import {
  buildTopMetrics,
  filterHistoryByPeriod,
} from "../services/portfolio/portfolioService";

import type {
  HistoryPoint,
  Period,
  AssetAmounts,
} from "../services/portfolio/portfolioService";

// portfolio components
import { PortfolioMetricsRow } from "../components/portfolio/PortfolioMetricsRow";
import { PortfolioChartCard } from "../components/portfolio/PortfolioChartCard";
import { PortfolioAllocationSection } from "../components/portfolio/PortfolioAllocationSection";

// локальный fallback (чтобы не зависеть от экспорта DEFAULT_AMOUNTS)
const DEFAULT_AMOUNTS: AssetAmounts = {
  ETH: 2,
  WBTC: 0.03,
  USDC: 80,
  DAI: 40,
  UNI: 400,
};

export function PortfolioPage() {
  const history = historyJson as unknown as HistoryPoint[];

  const [period, setPeriod] = useState<Period>("year");

  const filteredHistory = useMemo(
    () => filterHistoryByPeriod(history, period),
    [history, period]
  );

  const metrics = useMemo(
    () => buildTopMetrics(filteredHistory, DEFAULT_AMOUNTS, "BTC"),
    [filteredHistory]
  );

  return (
    <div>
      <PortfolioMetricsRow
        tvl={metrics.tvl}
        lastTsMs={metrics.lastTsMs}
        changeUsd={metrics.changeUsd}
        changePct={metrics.changePct}
        vsBtcPp={metrics.vsBtcPp}
        btcPct={metrics.btcPct}
        period={period}
      />

      <PortfolioChartCard
        history={filteredHistory}
        period={period}
        onPeriodChange={setPeriod}
        amounts={DEFAULT_AMOUNTS}
      />

      <PortfolioAllocationSection history={filteredHistory} amounts={DEFAULT_AMOUNTS} />

      {/* amounts сюда НЕ передаём (компонент его не принимает) */}
    </div>
  );
}
