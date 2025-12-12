import type { Scenario } from "../../services/monteCarloService";

export type SimulationParams = {
  horizonDays: 30 | 90 | 180 | 365;
  scenario: Scenario;
  simulations: 50 | 100 | 200;
  showCloud: boolean;
};

type Props = {
  value: SimulationParams;
  onChange: (next: SimulationParams) => void;
};

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn btn-sm"
      style={{
        borderRadius: 10,
        padding: "6px 10px",
        border: "1px solid rgba(255,255,255,0.10)",
        background: active ? "rgba(14,165,233,0.22)" : "rgba(15,23,42,0.6)",
        color: active ? "#e5e7eb" : "rgba(229,231,235,0.85)",
        fontWeight: 600,
        letterSpacing: 0.2,
      }}
    >
      {label}
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 12,
          color: "rgba(148,163,184,0.9)",
          fontWeight: 700,
          letterSpacing: 0.25,
          marginBottom: 8,
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

export function SimulationControls({ value, onChange }: Props) {
  return (
    <div
      style={{
        padding: 14,
        background: "rgba(2,6,23,0.35)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 10,
      }}
    >
      <Section title="Horizon">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {([30, 90, 180, 365] as const).map((d) => (
            <Chip
              key={d}
              label={`${d}d`}
              active={value.horizonDays === d}
              onClick={() => onChange({ ...value, horizonDays: d })}
            />
          ))}
        </div>
      </Section>

      <Section title="Scenario">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(
            [
              ["conservative", "Conservative"],
              ["baseline", "Baseline"],
              ["stress", "Stress"],
            ] as const
          ).map(([key, label]) => (
            <Chip
              key={key}
              label={label}
              active={value.scenario === key}
              onClick={() => onChange({ ...value, scenario: key })}
            />
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "rgba(148,163,184,0.85)" }}>
          Risk regime (volatility scaling)
        </div>
      </Section>

      <Section title="Simulations">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {([50, 100, 200] as const).map((n) => (
            <Chip
              key={n}
              label={`${n}`}
              active={value.simulations === n}
              onClick={() => onChange({ ...value, simulations: n })}
            />
          ))}
        </div>
      </Section>

      <Section title="Simulation cloud">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => onChange({ ...value, showCloud: !value.showCloud })}
            style={{
              borderRadius: 999,
              padding: "6px 12px",
              border: "1px solid rgba(255,255,255,0.10)",
              background: value.showCloud
                ? "rgba(34,197,94,0.18)"
                : "rgba(15,23,42,0.6)",
              color: value.showCloud ? "#e5e7eb" : "rgba(229,231,235,0.85)",
              fontWeight: 700,
            }}
          >
            {value.showCloud ? "On" : "Off"}
          </button>

          <div style={{ fontSize: 12, color: "rgba(148,163,184,0.85)" }}>
            Show simulated paths behind the forecast
          </div>
        </div>
      </Section>
    </div>
  );
}
