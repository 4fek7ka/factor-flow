import { useMemo, useState } from "react";
import historyJson from "../data/mock-history.json";

import type { HistoryPoint } from "../services/portfolioService";
import { filterHistoryByPeriod } from "../services/portfolioService";

import { runMonteCarloAdvanced } from "../services/monteCarloService";

import { SimulationChartCard } from "../components/simulation/SimulationChartCard";
import {
  SimulationControls,
  type SimulationParams,
} from "../components/simulation/SimulationControls";

import { OutcomeDistributionCard } from "../components/simulation/OutcomeDistributionCard";
import { FinalOutcomeCard } from "../components/simulation/FinalOutcomeCard";

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
    showRange: true,
  });

  const filteredHistory = useMemo(() => {
    const period = periodFromHorizon(params.horizonDays);
    return filterHistoryByPeriod(history, period);
  }, [history, params.horizonDays]);

  // 🔒 fixed parameters
  const drift = 0.00035;
  const volatility = 0.01237;

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

  const medianFinal =
    sim.median.length > 0
      ? sim.median[sim.median.length - 1]
      : startValue;

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 320px",
          gap: 14,
          alignItems: "stretch",
          marginTop: 10,
        }}
      >
        <div
          style={{
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12,
            padding: 8,
            height: "100%",
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
            onToggleRange={() =>
              setParams((p) => ({ ...p, showRange: !p.showRange }))
            }
          />
        </div>

        <div className="h-100" style={{ minHeight: 0 }}>
          <SimulationControls value={params} onChange={setParams} />
        </div>
      </div>

      {/* cards under chart */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 14,
          marginTop: 14,
        }}
      >
        <FinalOutcomeCard
          startValue={startValue}
          median={medianFinal}
        />

        <OutcomeDistributionCard paths={sim.paths} />
      </div>
    </div>
  );
}
