import { useMemo, useState } from "react";

import { SimulationControls } from "../components/simulation/SimulationControls";
import type { SimulationParams } from "../components/simulation/SimulationControls";

import { SimulationChartCard } from "../components/simulation/SimulationChartCard";
import { runMonteCarloAdvanced } from "../services/monteCarloService";

export function SimulationPage() {
  const [params, setParams] = useState<SimulationParams>({
    driftPct: 0.05,
    volatilityPct: 2.0,
    horizonDays: 90,
    simulations: 50,
    showCloud: false,
  });

  const sim = useMemo(
    () =>
      runMonteCarloAdvanced({
        startValue: 100,
        driftPct: params.driftPct,
        volatilityPct: params.volatilityPct,
        horizonDays: params.horizonDays,
        simulations: params.simulations,
      }),
    [params]
  );

  return (
    <div>
      <div className="page-header mb-2">
        <h2 className="page-title">Monte Carlo Simulation</h2>
        <div className="text-muted">
          Probabilistic forecast based on drift + volatility model
        </div>
      </div>

      <div
        style={{
          background: "#0f172a",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8,
          marginTop: 10,
          marginBottom: 16,
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
        />
      </div>

      <SimulationControls value={params} onChange={setParams} />
    </div>
  );
}
