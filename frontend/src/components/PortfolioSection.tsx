import { useMemo, useState } from "react";
import historyJson from "../data/mock-history.json";

import {
  buildTopMetrics,
  filterHistoryByPeriod,
} from "../services/portfolioService";

import type { HistoryPoint, Period } from "../services/portfolioService";

import { PortfolioMetricsRow } from "./PortfolioMetricsRow";
import { PortfolioChartCard } from "./PortfolioChartCard";
import { AssetSparklinesSection } from "./AssetSparklinesSection";
import { PortfolioAllocationSection } from "./PortfolioAllocationSection";

export function PortfolioSection() {
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
      {/* МИНИ-ГРАФИКИ ТОП АКТИВОВ (24H) */}
      {/* ============================== */}
      

      {/* ============================== */}
      {/* PORTFOLIO ALLOCATION + MARKET MOOD */}
      {/* ============================== */}
      <PortfolioAllocationSection history={filteredHistory} />

      <AssetSparklinesSection history={filteredHistory} />
    </div>
  );
}
