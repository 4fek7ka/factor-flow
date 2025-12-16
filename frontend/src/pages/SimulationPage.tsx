// SimulationPage.tsx
import { useMemo, useState } from "react";
import historyJson from "../data/mock-history.json";

import type { HistoryPoint } from "../services/portfolio/portfolioService";
import { filterHistoryByPeriod } from "../services/portfolio/portfolioService";

import { estimatePortfolioParams } from "../services/portfolio/portfolioStatsService";
import { runMonteCarloAdvanced } from "../services/simulation/monteCarloService";

import { SimulationChartCard } from "../components/simulation/SimulationChartCard";
import {
  SimulationControls,
  type SimulationParams,
} from "../components/simulation/SimulationControls";

import { FinalOutcomeCard } from "../components/simulation/FinalOutcomeCard";
import { OutcomeDistributionCard } from "../components/simulation/OutcomeDistributionCard";

function periodFromHorizon(h: 30 | 90 | 180 | 365) {
  if (h === 30) return "month";
  if (h === 90) return "month";
  if (h === 180) return "year";
  return "year";
}

export function SimulationPage() {
  const history = historyJson as unknown as HistoryPoint[];

  const [params, setParams] = useState<SimulationParams>({
    horizonDays: 90,
    scenario: "baseline",
    simulations: 50,
    showCloud: false,
    showMedian: false,
    showRepresentative: true,

    // Range: last + OFF by default
    showRange: false,

    // Fan: second + ON by default
    showFan: true,
  });

  const filteredHistory = useMemo(() => {
    const period = periodFromHorizon(params.horizonDays);
    return filterHistoryByPeriod(history, period);
  }, [history, params.horizonDays]);

  const { drift, volatility } = useMemo(() => {
    return estimatePortfolioParams(filteredHistory);
  }, [filteredHistory]);

  const startValue = 100;

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
    drift,
    volatility,
    params.horizonDays,
    params.simulations,
    params.scenario,
    startValue,
  ]);

  const finalMedian = sim.median.at(-1) ?? startValue;

  return (
    <div style={{ marginTop: 10 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 320px",
          gap: 14,
        }}
      >
        {/* LEFT COLUMN */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            minWidth: 0,
          }}
        >
          {/* chart */}
          <div
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: 8,
            }}
          >
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
          </div>

          {/* cards under chart */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            <FinalOutcomeCard startValue={startValue} median={finalMedian} />
            <OutcomeDistributionCard paths={sim.paths} />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <SimulationControls value={params} onChange={setParams} />
        </div>
      </div>
    </div>
  );
}
