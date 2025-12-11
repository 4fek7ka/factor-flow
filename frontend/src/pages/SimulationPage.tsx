// src/pages/SimulationPage.tsx

import { useState } from "react";

import { SimulationControls } from "../components/simulation/SimulationControls";
import type { SimulationParams } from "../components/simulation/SimulationControls";

import { SimulationChartCard } from "../components/simulation/SimulationChartCard";

export function SimulationPage() {
  const [mode, setMode] = useState<"simple" | "advanced">("simple");

  const [params, setParams] = useState<SimulationParams>({
    driftPct: 0.05,
    volatilityPct: 2.0,
    horizonDays: 90,
    simulations: 200,
  });

  const startValue = 100;

  return (
    <div>
      {/* HEADER */}
      <div className="page-header mb-2">
        <h2 className="page-title">Monte Carlo Simulation</h2>
        <div className="text-muted">
          Probabilistic forecast based on drift + volatility model
        </div>
      </div>

      {/* MODE SWITCH */}
      <div
        style={{
          display: "flex",
          gap: 12,
          margin: "20px 0",
        }}
      >
        <button
          onClick={() => setMode("simple")}
          style={{
            ...modeButton,
            background: mode === "simple" ? "#1e3a8a" : "#0f172a",
          }}
        >
          Simple
        </button>

        <button
          onClick={() => setMode("advanced")}
          style={{
            ...modeButton,
            background: mode === "advanced" ? "#1e3a8a" : "#0f172a",
          }}
        >
          Advanced
        </button>
      </div>

      {/* CHART (наверху) */}
      <div
        style={{
          background: "#0f172a",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8,
          marginTop: 10,
          marginBottom: 24,
        }}
      >
        <SimulationChartCard
          mode={mode}
          params={params}
          startValue={startValue}
        />
      </div>

      {/* CONTROLS (вкладка настроек — ВНИЗУ СТРАНИЦЫ) */}
      <SimulationControls value={params} onChange={setParams} mode={mode} />
    </div>
  );
}

const modeButton: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#e2e8f0",
  cursor: "pointer",
  fontSize: 14,
};
