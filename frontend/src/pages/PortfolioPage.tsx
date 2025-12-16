import { useMemo, useState } from "react";

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

// portfolio components
import { PortfolioMetricsRow } from "../components/portfolio/PortfolioMetricsRow";
import { PortfolioChartCard } from "../components/portfolio/PortfolioChartCard";
import { AssetSparklinesSection } from "../components/portfolio/AssetSparklinesSection";
import { PortfolioAllocationSection } from "../components/portfolio/PortfolioAllocationSection";

type MockProfile = {
  id: string;
  name: string;
  owner?: { name?: string; address?: string };
  description?: string;
  assets: AssetAmounts; // количества монет
};

type MockPortfoliosFile = {
  profiles: MockProfile[];
};

export function PortfolioPage() {
  const history = historyJson as unknown as HistoryPoint[];

  const portfolios = (portfoliosJson as unknown as MockPortfoliosFile).profiles;
  const defaultProfileId = portfolios[0]?.id ?? "conservative";

  const [profileId, setProfileId] = useState<string>(defaultProfileId);
  const [period, setPeriod] = useState<Period>("year");

  const profile = useMemo(() => {
    return portfolios.find((p) => p.id === profileId) ?? portfolios[0];
  }, [portfolios, profileId]);

  const amounts = profile?.assets ?? {};

  // фильтрация под период
  const filteredHistory = useMemo(
    () => filterHistoryByPeriod(history, period),
    [history, period]
  );

  // метрики сверху (ВАЖНО: считаются от amounts профиля)
  const metrics = useMemo(
    () => buildTopMetrics(filteredHistory, amounts, "BTC"),
    [filteredHistory, amounts]
  );

  const profileSymbols = useMemo(() => {
    const syms = Object.keys(amounts || {});
    // чтобы не раздувать UI — первые 5 по убыванию количества
    return syms
      .sort((a, b) => (amounts[b] ?? 0) - (amounts[a] ?? 0))
      .slice(0, 5);
  }, [amounts]);

  return (
    <div>
      {/* ============================== */}
      {/* PROFILE SELECT */}
      {/* ============================== */}
      <div className="row row-cards mb-3">
        <div className="col-12">
          <div className="card card-sm">
            <div className="card-body">
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 240 }}>
                  <div className="text-muted">Profile</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>
                    {profile?.name ?? "—"}
                  </div>
                  {profile?.owner?.address && (
                    <div className="text-muted" style={{ marginTop: 4 }}>
                      {profile.owner.address}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select
                    className="form-select"
                    value={profileId}
                    onChange={(e) => setProfileId(e.target.value)}
                    style={{ width: 260 }}
                  >
                    {portfolios.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {profile?.description && (
                <div className="text-muted" style={{ marginTop: 10 }}>
                  {profile.description}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================== */}
      {/* МЕТРИКИ НАВЕРХУ */}
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
        history={history}
        amounts={amounts}
      />

      {/* ============================== */}
      {/* PORTFOLIO ALLOCATION + VOLATILITY */}
      {/* ============================== */}
      <PortfolioAllocationSection history={filteredHistory} amounts={amounts} />

      {/* ============================== */}
      {/* МИНИ-ГРАФИКИ АКТИВОВ (24H) */}
      {/* ============================== */}
      <AssetSparklinesSection history={filteredHistory} symbols={profileSymbols} />
    </div>
  );
}
