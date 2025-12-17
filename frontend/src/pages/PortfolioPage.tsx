import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import historyJson from "../data/mock-history.json";
import portfoliosJson from "../data/mock-portfolios.json";

import {
  buildTopMetrics,
  filterHistoryByPeriod,
} from "../services/portfolio/portfolioService";

import type {
  AssetAmounts,
  HistoryPoint,
  Period,
} from "../services/portfolio/portfolioService";

// components
import { PortfolioMetricsRow } from "../components/portfolio/PortfolioMetricsRow";
import { PortfolioChartCard } from "../components/portfolio/PortfolioChartCard";
//import { AssetSparklinesSection } from "../components/portfolio/AssetSparklinesSection";
import { PortfolioAllocationSection } from "../components/portfolio/PortfolioAllocationSection";

type OutletCtx = {
  profileId: string;
};

type Profile = {
  id: string;
  name: string;
  assets: AssetAmounts;
};

export function PortfolioPage() {
  const { profileId } = useOutletContext<OutletCtx>();

  const history = historyJson as unknown as HistoryPoint[];
  const profiles = (portfoliosJson as any).profiles as Profile[];

  const profile = profiles.find((p) => p.id === profileId) ?? profiles[0];

  const amounts = profile.assets;

  const [period, setPeriod] = useState<Period>("year");

  const filteredHistory = useMemo(
    () => filterHistoryByPeriod(history, period),
    [history, period]
  );

  const metrics = useMemo(
    () => buildTopMetrics(filteredHistory, amounts, "BTC"),
    [filteredHistory, amounts]
  );

  /*const profileSymbols = useMemo(() => {
    return Object.keys(amounts)
      .sort((a, b) => (amounts[b] ?? 0) - (amounts[a] ?? 0))
      .slice(0, 5);
  }, [amounts]);*/

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
        history={history}
        period={period}
        onPeriodChange={setPeriod}
        amounts={amounts}
      />

      {/* ✅ VolatilityArcCard под графиком УБРАН (чтобы не было дубля) */}

      <PortfolioAllocationSection history={filteredHistory} amounts={amounts} />

    {/*<AssetSparklinesSection history={filteredHistory} symbols={profileSymbols} />*/}
    </div>
  );
}
