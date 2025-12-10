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
          className="text-muted"
          style={{
            position: "absolute",
            top: 14,       // ← добавили отступ сверху
            left: 12,
            fontSize: "0.75rem",
            opacity: 0.85,
          }}
        >
          Fear & Greed
        </div>

        {/* Контейнер gauge */}
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

          {/* ЦЕНТРАЛЬНЫЙ ТЕКСТ ВНУТРИ ДУГИ */}
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
                margin: 0,
              }}
            >
              {value}
            </div>

            <div
              style={{
                fontSize: "0.85rem",
                opacity: 0.8,
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
