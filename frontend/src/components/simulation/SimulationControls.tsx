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

      <Section title="Visual layers">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Chip
            label={`Main ${value.showRepresentative ? "On" : "Off"}`}
            active={value.showRepresentative}
            onClick={() =>
              onChange({
                ...value,
                showRepresentative: !value.showRepresentative,
              })
            }
          />

          <Chip
            label={`Range ${value.showRange ? "On" : "Off"}`}
            active={value.showRange}
            onClick={() =>
              onChange({ ...value, showRange: !value.showRange })
            }
          />

          <Chip
            label={`Median ${value.showMedian ? "On" : "Off"}`}
            active={value.showMedian}
            onClick={() =>
              onChange({ ...value, showMedian: !value.showMedian })
            }
          />

          <Chip
            label={`Cloud ${value.showCloud ? "On" : "Off"}`}
            active={value.showCloud}
            onClick={() =>
              onChange({ ...value, showCloud: !value.showCloud })
            }
          />
        </div>
      </Section>
    </div>
  );
}
