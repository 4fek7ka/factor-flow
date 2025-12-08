import { useMemo, useState } from "react";
import historyJson from "../data/mock-history.json";

import {
  buildTopMetrics,
  filterHistoryByPeriod,
} from "../services/portfolioService";

import type { HistoryPoint, Period } from "../services/portfolioService";

import { PortfolioMetricsRow } from "./PortfolioMetricsRow";
import { PortfolioChartCard } from "./PortfolioChartCard"; // ✅ ВОТ ЭТОГО ИМПОРТА НЕ ХВАТАЛО

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
      {/* ✅ МЕТРИКИ — ОТДЕЛЬНО СВЕРХУ */}
      <PortfolioMetricsRow
        tvl={metrics.tvl}
        lastTsMs={metrics.lastTsMs}
        changeUsd={metrics.changeUsd}
        changePct={metrics.changePct}
        vsBtcPp={metrics.vsBtcPp}
        btcPct={metrics.btcPct}
        period={period}
      />

      {/* ✅ ГРАФИК — В ОТДЕЛЬНОЙ КАРТОЧКЕ */}
      <PortfolioChartCard
        period={period}
        onPeriodChange={setPeriod}
        history={filteredHistory}
      />
    </div>
  );
}
