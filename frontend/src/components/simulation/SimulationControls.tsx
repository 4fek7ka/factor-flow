// src/components/simulation/SimulationControls.tsx

import { useState } from "react";

export type SimulationParams = {
  driftPct: number;       // средний дневной рост (%)
  volatilityPct: number;  // дневная волатильность (%)
  horizonDays: number;    // горизонт симуляции
  simulations: number;    // количество траекторий
  showCloud: boolean;     // показывать/скрывать облако линий
};

type Props = {
  value: SimulationParams;
  onChange: (v: SimulationParams) => void;
};

const HORIZON_OPTIONS = [30, 60, 90, 180, 365];
const SIM_OPTIONS = [50, 100, 150, 200];

export function SimulationControls({ value, onChange }: Props) {
  const [local, setLocal] = useState<SimulationParams>(value);

  function update<K extends keyof SimulationParams>(key: K, val: SimulationParams[K]) {
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
        marginTop: 12,
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

      {/* Show cloud toggle */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            marginBottom: 6,
            color: "#94a3b8",
            fontSize: 14,
          }}
        >
          Simulation cloud
        </div>
        <button
          type="button"
          onClick={() => update("showCloud", !local.showCloud)}
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            border: "1px solid rgba(148,163,184,0.6)",
            background: local.showCloud ? "#1e3a8a" : "#020617",
            color: "#e2e8f0",
            fontSize: 13,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: local.showCloud ? "#22c55e" : "#64748b",
            }}
          />
          {local.showCloud ? "Cloud ON" : "Cloud OFF"}
        </button>
      </div>

      {/* Horizon options */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            marginBottom: 6,
            color: "#94a3b8",
            fontSize: 14,
          }}
        >
          Horizon
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {HORIZON_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => update("horizonDays", d)}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.6)",
                background:
                  local.horizonDays === d ? "#1e3a8a" : "transparent",
                color: "#e2e8f0",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Simulations options */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            marginBottom: 6,
            color: "#94a3b8",
            fontSize: 14,
          }}
        >
          Number of simulations
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SIM_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => update("simulations", n)}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.6)",
                background:
                  local.simulations === n ? "#1e3a8a" : "transparent",
                color: "#e2e8f0",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Drift */}
      <div style={{ marginBottom: 12 }}>
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
      <div>
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
