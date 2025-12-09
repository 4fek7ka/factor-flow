import { useMemo, useState } from "react";
import historyJson from "../data/mock-history.json";

import {
  buildTopMetrics,
  filterHistoryByPeriod,
} from "../services/portfolioService";

import type { HistoryPoint, Period } from "../services/portfolioService";

// portfolio components
import { PortfolioMetricsRow } from "../components/portfolio/PortfolioMetricsRow";
import { PortfolioChartCard } from "../components/portfolio/PortfolioChartCard";
import { AssetSparklinesSection } from "../components/portfolio/AssetSparklinesSection";
import { PortfolioAllocationSection } from "../components/portfolio/PortfolioAllocationSection";

export function PortfolioPage() {
  const history = historyJson as unknown as HistoryPoint[];

  const [period, setPeriod] = useState<Period>("year");

  // фильтрация под период
  const filteredHistory = useMemo(
    () => filterHistoryByPeriod(history, period),
    [history, period]
  );

  // метрики сверху
  const metrics = useMemo(
    () => buildTopMetrics(filteredHistory),
    [filteredHistory]
  );

  return (
    <div>
      {/* ============================== */}
      {/* МЕТРИКИ НАД ГРАФИКОМ */}
      {/* ============================== */}
      <PortfolioMetricsRow
        tvl={metrics.tvl}
        lastTsMs={metrics.lastTsMs}
        changeUsd={metrics.changeUsd}
        changePct={metrics.changePct}
        vsBtcPp={metrics.vsBtcPp}
        btcPct={metrics.btcPct}
        period={period}
      />

      {/* ============================== */}
      {/* ОСНОВНОЙ ГРАФИК ПОРТФЕЛЯ */}
      {/* ============================== */}
      <PortfolioChartCard
        period={period}
        onPeriodChange={setPeriod}
        history={filteredHistory}
      />

      {/* ============================== */}
      {/* PORTFOLIO ALLOCATION + MARKET MOOD */}
      {/* ============================== */}
      <PortfolioAllocationSection history={filteredHistory} />

      {/* ============================== */}
      {/* МИНИ-ГРАФИКИ ТОП АКТИВОВ (24H) */}
      {/* ============================== */}
      <AssetSparklinesSection history={filteredHistory} />
    </div>
  );
}
