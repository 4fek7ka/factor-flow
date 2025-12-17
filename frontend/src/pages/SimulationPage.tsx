import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Reveal } from "../components/Reveal";

import historyJson from "../data/mock-history.json";
import portfoliosJson from "../data/mock-portfolios.json";

import type {
  AssetAmounts,
  HistoryPoint,
} from "../services/portfolio/portfolioService";

import {
  filterHistoryByPeriod,
} from "../services/portfolio/portfolioService";

import {
  estimatePortfolioParams,
} from "../services/portfolio/portfolioStatsService";

import {
  runMonteCarloAdvanced,
} from "../services/simulation/monteCarloService";

import { SimulationChartCard } from "../components/simulation/SimulationChartCard";
import {
  SimulationControls,
  type SimulationParams,
} from "../components/simulation/SimulationControls";
import { FinalOutcomeCard } from "../components/simulation/FinalOutcomeCard";
import { OutcomeDistributionCard } from "../components/simulation/OutcomeDistributionCard";

type OutletCtx = {
  profileId: string;
};

type Profile = {
  id: string;
  assets: AssetAmounts;
};

function periodFromHorizon(h: number) {
  if (h <= 30) return "month";
  if (h <= 90) return "month";
  return "year";
}

export function SimulationPage() {
  const { profileId } = useOutletContext<OutletCtx>();

  const history = historyJson as unknown as HistoryPoint[];
  const profiles = (portfoliosJson as any).profiles as Profile[];

  const profile =
    profiles.find((p) => p.id === profileId) ?? profiles[0];

  const amounts = profile.assets;

  const [params, setParams] = useState<SimulationParams>({
    horizonDays: 90,
    scenario: "baseline",
    simulations: 50,
    showCloud: false,
    showMedian: false,
    showRepresentative: true,
    showRange: false,
    showFan: true,
  });

  /* =========================
     HISTORY
  ========================= */
  const filteredHistory = useMemo(() => {
    const period = periodFromHorizon(params.horizonDays) as any;
    return filterHistoryByPeriod(history, period);
  }, [history, params.horizonDays]);

  /* =========================
     PARAM ESTIMATION
  ========================= */
  const { drift, volatility } = useMemo(() => {
    return estimatePortfolioParams(filteredHistory, amounts);
  }, [filteredHistory, amounts]);

  /* =========================
     START VALUE
  ========================= */
  const startValue = useMemo(() => {
    if (!filteredHistory.length) return 100;
    const last = filteredHistory[filteredHistory.length - 1];
    let v = 0;
    for (const [sym, amt] of Object.entries(amounts)) {
      v += (last.prices[sym] ?? 0) * amt;
    }
    return v || 100;
  }, [filteredHistory, amounts]);

  /* =========================
     MONTE CARLO
  ========================= */
  const sim = useMemo(() => {
    return runMonteCarloAdvanced({
      startValue,
      drift,
      volatility,
      horizonDays: params.horizonDays,
      simulations: params.simulations,
      scenario: params.scenario,
    });
  }, [
    startValue,
    drift,
    volatility,
    params.horizonDays,
    params.simulations,
    params.scenario,
  ]);

  const finalMedian = sim.median.at(-1) ?? startValue;

  /* =========================
     READY FLAG (КЛЮЧЕВОЕ)
  ========================= */
  const ready =
    filteredHistory.length > 0 &&
    Number.isFinite(drift) &&
    Number.isFinite(volatility) &&
    sim.timestamps.length > 0;

  /* =========================
     RENDER
  ========================= */
  return (
    <div key={ready ? "ready" : "loading"} style={{ marginTop: 10 }}>
      {ready && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 320px",
            gap: 14,
          }}
        >
          {/* ===== LEFT ===== */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              minWidth: 0,
            }}
          >
            {/* 🟣 График — первая волна */}
            <Reveal delayMs={0}>
              <SimulationChartCard
                timestamps={sim.timestamps}
                median={sim.median}
                representative={sim.representative}
                upper={sim.upper}
                lower={sim.lower}
                cloud={sim.paths}
                showCloud={params.showCloud}
                showMedian={params.showMedian}
                showRepresentative={params.showRepresentative}
                showRange={params.showRange}
                showFan={params.showFan}
                onToggleCloud={() =>
                  setParams((p) => ({ ...p, showCloud: !p.showCloud }))
                }
                onToggleMedian={() =>
                  setParams((p) => ({ ...p, showMedian: !p.showMedian }))
                }
                onToggleRepresentative={() =>
                  setParams((p) => ({
                    ...p,
                    showRepresentative: !p.showRepresentative,
                  }))
                }
                onToggleFan={() =>
                  setParams((p) => ({ ...p, showFan: !p.showFan }))
                }
                onToggleRange={() =>
                  setParams((p) => ({ ...p, showRange: !p.showRange }))
                }
              />
            </Reveal>

            {/* 🟣 Итоги — вторая волна */}
            <Reveal delayMs={100}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 14,
                }}
              >
                <FinalOutcomeCard
                  startValue={startValue}
                  median={finalMedian}
                />
                <OutcomeDistributionCard paths={sim.paths} />
              </div>
            </Reveal>
          </div>

          {/* ===== RIGHT ===== */}
          <Reveal delayMs={60}>
            <SimulationControls value={params} onChange={setParams} />
          </Reveal>
        </div>
      )}
    </div>
  );
}
