import type { ReactNode } from "react";
import type { Scenario } from "../../services/monteCarloService";

export type SimulationParams = {
  horizonDays: 30 | 90 | 180 | 365;
  scenario: Scenario;
  simulations: 50 | 100 | 200;

  showCloud: boolean;
  showMedian: boolean;
  showRepresentative: boolean;
  showRange: boolean;
};

type Props = {
  value: SimulationParams;
  onChange: (next: SimulationParams) => void;
};

const HORIZONS = [30, 90, 180, 365] as const;
const SIMULATIONS = [50, 100, 200] as const;
const SCENARIOS = [
  ["conservative", "Conservative"],
  ["baseline", "Baseline"],
  ["stress", "Stress"],
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0.4,
          textTransform: "uppercase",
          color: "rgba(148,163,184,0.75)",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function SegButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: 800,
        borderRadius: 8,
        border: active
          ? "1px solid rgba(56,189,248,0.55)"
          : "1px solid rgba(255,255,255,0.10)",
        background: active
          ? "rgba(14,165,233,0.22)"
          : "rgba(15,23,42,0.45)",
        color: active
          ? "rgba(226,232,240,0.95)"
          : "rgba(226,232,240,0.75)",
        cursor: "pointer",
        transition: "all 120ms ease",
      }}
    >
      {label}
    </button>
  );
}

function SegGroup({
  children,
  cols,
}: {
  children: ReactNode;
  cols: number;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
        gap: 6,
        padding: 6,
        borderRadius: 10,
        background: "rgba(2,6,23,0.35)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {children}
    </div>
  );
}

export function SimulationControls({ value, onChange }: Props) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 12,
        background: "rgba(15,23,42,0.34)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* header */}
      <div style={{ padding: 14, flexShrink: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 14 }}>
          Simulation settings
        </div>
        <div style={{ fontSize: 12, color: "rgba(148,163,184,0.8)" }}>
          Horizon, scenario and runs
        </div>
      </div>

      {/* content */}
      <div
        style={{
          padding: "0 14px 14px",
          overflowY: "auto",
          flex: 1,
        }}
      >
        <Section title="Horizon">
          <SegGroup cols={4}>
            {HORIZONS.map((d) => (
              <SegButton
                key={d}
                label={`${d}d`}
                active={value.horizonDays === d}
                onClick={() => onChange({ ...value, horizonDays: d })}
              />
            ))}
          </SegGroup>
        </Section>

        <Section title="Scenario">
          <SegGroup cols={3}>
            {SCENARIOS.map(([key, label]) => (
              <SegButton
                key={key}
                label={label}
                active={value.scenario === key}
                onClick={() =>
                  onChange({ ...value, scenario: key })
                }
              />
            ))}
          </SegGroup>
        </Section>

        <Section title="Simulations">
          <SegGroup cols={3}>
            {SIMULATIONS.map((n) => (
              <SegButton
                key={n}
                label={`${n}`}
                active={value.simulations === n}
                onClick={() =>
                  onChange({ ...value, simulations: n })
                }
              />
            ))}
          </SegGroup>
        </Section>
      </div>
    </div>
  );
}
