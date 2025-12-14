import { useMemo, useState } from "react";
import historyJson from "../data/mock-history.json";

import type { HistoryPoint } from "../services/portfolioService";
import { filterHistoryByPeriod } from "../services/portfolioService";

import { estimatePortfolioParams } from "../services/portfolioStatsService";
import { runMonteCarloAdvanced } from "../services/monteCarloService";

import { SimulationChartCard } from "../components/simulation/SimulationChartCard";
import {
  SimulationControls,
  type SimulationParams,
} from "../components/simulation/SimulationControls";

function periodFromHorizon(h: 30 | 90 | 180 | 365) {
  if (h === 30) return "month";
  if (h === 90) return "month";
  if (h === 180) return "year";
  return "year";
}

function formatMoney(v: number) {
  if (!Number.isFinite(v)) return "-";
  return v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
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

  const finalMedian = sim.median[sim.median.length - 1] ?? startValue;
  const finalUpper = sim.upper[sim.upper.length - 1] ?? startValue;
  const finalLower = sim.lower[sim.lower.length - 1] ?? startValue;

  const probGain = useMemo(() => {
    if (!sim.paths.length) return 0;
    let wins = 0;
    for (const p of sim.paths) {
      if (p[p.length - 1] > startValue) wins++;
    }
    return (wins / sim.paths.length) * 100;
  }, [sim.paths, startValue]);

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

            /* 🔑 INLINE LEGEND CALLBACKS */
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

      <div className="row row-cards" style={{ marginTop: 14 }}>
        <div className="col-12 col-md-4 d-flex">
          <div className="card card-sm w-100">
            <div className="card-body">
              <div className="text-muted">Median (T)</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>
                {formatMoney(finalMedian)}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4 d-flex">
          <div className="card card-sm w-100">
            <div className="card-body">
              <div className="text-muted">P(Value &gt; Start)</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>
                {probGain.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4 d-flex">
          <div className="card card-sm w-100">
            <div className="card-body">
              <div className="text-muted">Expected range (T)</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>
                {formatMoney(finalLower)} – {formatMoney(finalUpper)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "#94a3b8" }}>
        drift={drift.toFixed(5)}, volatility={volatility.toFixed(5)}
      </div>
    </div>
  );
}
