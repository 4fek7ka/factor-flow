// src/components/simulation/SimulationControls.tsx

import { useState } from "react";

export type SimulationParams = {
  driftPct: number;      // средний дневной рост (%)
  volatilityPct: number; // дневная волатильность (%)
  horizonDays: number;   // горизонт симуляции
  simulations: number;   // количество траекторий (для Advanced)
};

type Props = {
  value: SimulationParams;
  onChange: (v: SimulationParams) => void;
  mode: "simple" | "advanced";
};

export function SimulationControls({ value, onChange, mode }: Props) {
  const [local, setLocal] = useState<SimulationParams>(value);

  function update<K extends keyof SimulationParams>(key: K, val: number) {
    const next = { ...local, [key]: val };
    setLocal(next);
    onChange(next);
  }

  return (
    <div
      style={{
        background: "#0f172a",
        padding: "16px 20px",
        borderRadius: 8,
        marginBottom: 20,
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 12,
          color: "#e2e8f0",
        }}
      >
        Simulation Settings
      </div>

      {/* Drift */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", marginBottom: 4, color: "#94a3b8" }}>
          Drift (% / day)
        </label>
        <input
          type="number"
          value={local.driftPct}
          onChange={(e) => update("driftPct", Number(e.target.value))}
          style={inputStyle}
        />
      </div>

      {/* Volatility */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", marginBottom: 4, color: "#94a3b8" }}>
          Volatility (% / day)
        </label>
        <input
          type="number"
          value={local.volatilityPct}
          onChange={(e) => update("volatilityPct", Number(e.target.value))}
          style={inputStyle}
        />
      </div>

      {/* Horizon */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", marginBottom: 4, color: "#94a3b8" }}>
          Horizon (days)
        </label>
        <input
          type="number"
          value={local.horizonDays}
          onChange={(e) => update("horizonDays", Number(e.target.value))}
          style={inputStyle}
        />
      </div>

      {/* Simulations only in advanced mode */}
      {mode === "advanced" && (
        <div style={{ marginBottom: 4 }}>
          <label style={{ display: "block", marginBottom: 4, color: "#94a3b8" }}>
            Number of Simulations
          </label>
          <input
            type="number"
            value={local.simulations}
            onChange={(e) => update("simulations", Number(e.target.value))}
            style={inputStyle}
          />
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#1e293b",
  color: "#e2e8f0",
  fontSize: 14,
};
