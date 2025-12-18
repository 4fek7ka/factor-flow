// SimulationControls.tsx
import type { ReactNode } from "react";
import type { Scenario } from "../../services/simulation/monteCarloService";

export type SimulationParams = {
  horizonDays: 30 | 90 | 180 | 365;
  scenario: Scenario;
  simulations: 50 | 100 | 200;

  showCloud: boolean;
  showMedian: boolean;
  showRepresentative: boolean;
  showRange: boolean;

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

/* =========================
   UI helpers
========================= */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.4,
          textTransform: "uppercase",
          color: "var(--text-muted)",
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
        fontWeight: 700,
        borderRadius: 8,
        border: active
          ? "1px solid var(--primary)"
          : "1px solid var(--border)",
        background: active
          ? "var(--primary-soft)"
          : "var(--surface-hover)",
        color: active
          ? "var(--text-primary)"
          : "var(--text-secondary)",
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
          ? "1px solid var(--primary)"
          : "1px solid var(--border)",
        background: active
          ? "var(--primary-soft)"
          : "var(--surface-hover)",
        color: active
          ? "var(--text-primary)"
          : "var(--text-secondary)",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 700 }}>{label}</span>

      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: active
            ? "var(--primary)"
            : "var(--text-muted)",
        }}
      />
    </button>
  );
}

/* =========================
   Component
========================= */

export function SimulationControls({ value, onChange }: Props) {
  const patch = (next: Partial<SimulationParams>) =>
    onChange({ ...value, ...next });

  return (
    <div
      className="card"
      style={{
        height: "100%",
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="card-body"
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 0,
        }}
      >
        {/* HEADER */}
        <div style={{ padding: 14, flexShrink: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "var(--text-primary)",
            }}
          >
            Simulation settings
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            Horizon, scenario and runs
          </div>
        </div>

        {/* CONTENT */}
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
                label="Fan (Quantiles)"
                active={value.showFan}
                onClick={() => patch({ showFan: !value.showFan })}
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
              
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
