// SimulationControls.tsx
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

  // NEW: Quantile Fan
  showFan: boolean;
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
] as const satisfies readonly (readonly [Scenario, string])[];

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
        height: 32,
        padding: "0 10px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",

        fontSize: 12,
        fontWeight: 800,
        lineHeight: "16px",
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
        userSelect: "none",
      }}
    >
      {label}
    </button>
  );
}

function SegGroup({ children, cols }: { children: ReactNode; cols: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: 6,
      }}
    >
      {children}
    </div>
  );
}

function ToggleRow({
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
        height: 34,
        width: "100%",
        padding: "0 10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 10,

        border: active
          ? "1px solid rgba(56,189,248,0.45)"
          : "1px solid rgba(255,255,255,0.08)",

        background: active
          ? "rgba(14,165,233,0.14)"
          : "rgba(15,23,42,0.28)",

        color: active
          ? "rgba(226,232,240,0.95)"
          : "rgba(226,232,240,0.80)",

        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 800 }}>{label}</span>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: active ? "rgba(14,165,233,1)" : "rgba(100,116,139,1)",
        }}
      />
    </button>
  );
}

export function SimulationControls({ value, onChange }: Props) {
  const patch = (next: Partial<SimulationParams>) =>
    onChange({ ...value, ...next });

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
        <div style={{ fontWeight: 800, fontSize: 14 }}>Simulation settings</div>
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
                onClick={() => patch({ horizonDays: d })}
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
                onClick={() => patch({ scenario: key })}
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
                onClick={() => patch({ simulations: n })}
              />
            ))}
          </SegGroup>
        </Section>

        {/* NEW: overlays */}
        <Section title="Overlays">
          <div style={{ display: "grid", gap: 8 }}>
            <ToggleRow
              label="Main"
              active={value.showRepresentative}
              onClick={() =>
                patch({ showRepresentative: !value.showRepresentative })
              }
            />

            <ToggleRow
              label="Range"
              active={value.showRange}
              onClick={() => patch({ showRange: !value.showRange })}
            />

            <ToggleRow
              label="Median"
              active={value.showMedian}
              onClick={() => patch({ showMedian: !value.showMedian })}
            />

            <ToggleRow
              label="Cloud"
              active={value.showCloud}
              onClick={() => patch({ showCloud: !value.showCloud })}
            />

            <ToggleRow
              label="Fan (Quantiles)"
              active={value.showFan}
              onClick={() => patch({ showFan: !value.showFan })}
            />
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "rgba(148,163,184,0.78)",
              lineHeight: 1.35,
            }}
          >
            Fan builds quantile bands (P05–P95 and P25–P75) from simulation paths.
          </div>
        </Section>
      </div>
    </div>
  );
}