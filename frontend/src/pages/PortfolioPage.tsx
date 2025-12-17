// frontend/src/pages/PortfolioPage.tsx

import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import historyJson from "../data/mock-history.json";
import portfoliosJson from "../data/mock-portfolios.json";

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

type OutletCtx = {
  profileId: string;
};

type Profile = {
  id: string;
  assets: AssetAmounts;
};

// локальный fallback (если profileId не найден)
const FALLBACK_AMOUNTS: AssetAmounts = {
  ETH: 2,
  WBTC: 0.03,
  USDC: 80,
  DAI: 40,
  UNI: 400,
};

const PROFILES = ((portfoliosJson as any).profiles ?? []) as Profile[];

export function PortfolioPage() {
  const { profileId } = useOutletContext<OutletCtx>();

  const history = historyJson as unknown as HistoryPoint[];

  const amounts: AssetAmounts = useMemo(() => {
    const p = PROFILES.find((x) => x.id === profileId);
    return p?.assets ?? FALLBACK_AMOUNTS;
  }, [profileId]);

  const [period, setPeriod] = useState<Period>("year");

  const filteredHistory = useMemo(
    () => filterHistoryByPeriod(history, period),
    [history, period]
  );

  const metrics = useMemo(
    () => buildTopMetrics(filteredHistory, amounts, "BTC"),
    [filteredHistory, amounts]
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
        amounts={amounts}
      />

      <PortfolioAllocationSection history={filteredHistory} amounts={amounts} />
    </div>
  );
}
