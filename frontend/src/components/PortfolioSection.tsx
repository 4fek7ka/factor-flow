import { useMemo, useState } from "react";
import historyJson from "../data/mock-history.json";

import {
  buildTopMetrics,
  filterHistoryByPeriod,
} from "../services/portfolioService";

import type { HistoryPoint, Period } from "../services/portfolioService";

import { PortfolioMetricsRow } from "./PortfolioMetricsRow";
import { PortfolioChartCard } from "./PortfolioChartCard";
import { AssetSparklinesSection } from "./AssetSparklinesSection"; // ← добавлено

export function PortfolioSection() {
  const history = historyJson as unknown as HistoryPoint[];

  const [period, setPeriod] = useState<Period>("year");

  const filteredHistory = useMemo(
    () => filterHistoryByPeriod(history, period),
    [history, period]
  );

  const metrics = useMemo(
    () => buildTopMetrics(filteredHistory),
    [filteredHistory]
  );

  return (
    <div>
      {/* МЕТРИКИ НАД ГРАФИКОМ */}
      <PortfolioMetricsRow
        tvl={metrics.tvl}
        lastTsMs={metrics.lastTsMs}
        changeUsd={metrics.changeUsd}
        changePct={metrics.changePct}
        vsBtcPp={metrics.vsBtcPp}
        btcPct={metrics.btcPct}
        period={period}
      />

      {/* ГРАФИК */}
      <PortfolioChartCard
        period={period}
        onPeriodChange={setPeriod}
        history={filteredHistory}
      />

      {/* НОВАЯ СЕКЦИЯ — ТОП АКТИВЫ С МИНИ-ГРАФИКАМИ */}
      <AssetSparklinesSection
        history={filteredHistory}
      />
    </div>
  );
}
