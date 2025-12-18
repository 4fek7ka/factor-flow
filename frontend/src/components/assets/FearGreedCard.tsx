import { FearGreedGauge } from "./FearGreedGauge";

type Props = {
  value: number;
};

function labelFromValue(v: number) {
  if (v < 25) return "Extreme Fear";
  if (v < 45) return "Fear";
  if (v < 55) return "Neutral";
  if (v < 75) return "Greed";
  return "Extreme Greed";
}

export function FearGreedCard({ value }: Props) {
  const label = labelFromValue(value);

  return (
    <div
      className="card card-sm mb-3 h-100"
      style={{
        flex: 1,
        position: "relative",
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="card-body"
        style={{
          padding: "0 12px",
          position: "relative",
        }}
      >
        {/* Заголовок */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 12,
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            letterSpacing: "0.02em",
          }}
        >
          Fear & Greed
        </div>

        {/* Gauge */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 22,
            position: "relative",
            height: 90,
          }}
        >
          <FearGreedGauge value={value} width={160} height={80} />

          {/* Центр */}
          <div
            style={{
              position: "absolute",
              top: "80%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "1.35rem",
                fontWeight: 600,
                lineHeight: "1.2",
                color: "var(--text-primary)",
              }}
            >
              {value}
            </div>

            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
              }}
            >
              {label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
