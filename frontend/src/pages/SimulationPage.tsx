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
  });

  // Use same history logic as PortfolioPage (filtered by period)
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
  }, [drift, volatility, params, startValue]);

  // Metrics
  const finalMedian = sim.median[sim.median.length - 1] ?? startValue;
  const finalUpper = sim.upper[sim.upper.length - 1] ?? startValue;
  const finalLower = sim.lower[sim.lower.length - 1] ?? startValue;

  const probGain = useMemo(() => {
    if (!sim.paths.length) return 0;
    let wins = 0;
    for (const p of sim.paths) {
      const last = p[p.length - 1];
      if (last > startValue) wins++;
    }
    return (wins / sim.paths.length) * 100;
  }, [sim.paths, startValue]);

  return (
    <div>
      <div className="page-header mb-2">
        <h2 className="page-title">Monte Carlo Simulation</h2>
        <div className="text-muted">
          Forecast based on historical portfolio drift + volatility
        </div>
      </div>

      {/* CHART + RIGHT CONTROLS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 320px",
          gap: 14,
          alignItems: "start",
          marginTop: 10,
        }}
      >
        {/* Chart */}
        <div
          style={{
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 10,
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

        {/* Controls */}
        <SimulationControls value={params} onChange={setParams} />
      </div>

      {/* METRICS */}
      <div
        className="row row-cards"
        style={{ marginTop: 14, marginBottom: 4 }}
      >
        <div className="col-12 col-md-4 d-flex">
          <div
            className="card card-sm w-100"
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="card-body" style={{ padding: "12px 14px" }}>
              <div style={{ color: "rgba(148,163,184,0.9)", fontSize: 12 }}>
                Median (T)
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>
                {formatMoney(finalMedian)}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "rgba(148,163,184,0.85)" }}>
                Based on median of simulated outcomes
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4 d-flex">
          <div
            className="card card-sm w-100"
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="card-body" style={{ padding: "12px 14px" }}>
              <div style={{ color: "rgba(148,163,184,0.9)", fontSize: 12 }}>
                P(Value &gt; Start)
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>
                {probGain.toFixed(0)}%
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "rgba(148,163,184,0.85)" }}>
                Share of paths ending above start
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4 d-flex">
          <div
            className="card card-sm w-100"
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="card-body" style={{ padding: "12px 14px" }}>
              <div style={{ color: "rgba(148,163,184,0.9)", fontSize: 12 }}>
                Expected range (T)
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 6 }}>
                {formatMoney(finalLower)}{" "}
                <span style={{ color: "rgba(148,163,184,0.85)", fontWeight: 700 }}>
                  –
                </span>{" "}
                {formatMoney(finalUpper)}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "rgba(148,163,184,0.85)" }}>
                Upper/Lower bounds at horizon
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug-ish info (small, but useful for now) */}
      <div style={{ marginTop: 10, fontSize: 12, color: "rgba(148,163,184,0.85)" }}>
        Estimated from history: drift={drift.toFixed(5)}, volatility={volatility.toFixed(5)} (log-returns/day)
      </div>
    </div>
  );
}
