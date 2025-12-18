import { useMemo } from "react";

type Props = {
  startValue: number;
  median: number;
};

function formatMoney(v: number) {
  return v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function FinalOutcomeCard({ startValue, median }: Props) {
  const model = useMemo(() => {
    const deltaPct =
      startValue === 0 ? 0 : ((median - startValue) / startValue) * 100;

    const isPositive = deltaPct >= 0;

    const RANGE = 30;
    const clamped = Math.max(-RANGE, Math.min(RANGE, deltaPct));
    const posPct = ((clamped + RANGE) / (RANGE * 2)) * 100;

    return { deltaPct, isPositive, posPct, RANGE };
  }, [startValue, median]);

  const ACCENT_COLOR = model.isPositive
    ? "var(--positive)"
    : "var(--negative)";

  // ✅ ВСЕГДА показываем знак
  const sign = model.deltaPct >= 0 ? "+" : "-";

  const centerPct = 50;
  const fillLeft = model.isPositive ? centerPct : model.posPct;
  const fillWidth = Math.abs(model.posPct - centerPct);

  return (
    <div
      className="card card-sm w-100"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="card-body">
        <div
          style={{
            fontWeight: 600,
            marginBottom: 10,
            color: "var(--text-primary)",
          }}
        >
          Final outcome
        </div>

        {/* VALUE */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {formatMoney(median)}
          </div>

          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: ACCENT_COLOR,
            }}
          >
            {sign}
            {Math.abs(model.deltaPct).toFixed(1)}%
          </div>
        </div>

        {/* SCALE */}
        <div style={{ position: "relative", height: 20 }}>
          {/* base line */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 6,
              transform: "translateY(-50%)",
              borderRadius: 999,
              background: "var(--surface-hover)",
            }}
          />

          {/* filled range */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${fillLeft}%`,
              width: `${fillWidth}%`,
              height: 6,
              transform: "translateY(-50%)",
              borderRadius: 999,
              background: model.isPositive
                ? "rgba(34,197,94,0.35)"
                : "rgba(239,68,68,0.35)",
            }}
          />

          {/* center zero */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 2,
              height: 14,
              background: "var(--border)",
            }}
          />

          {/* marker */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${model.posPct}%`,
              transform: "translate(-50%, -50%)",
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: ACCENT_COLOR,
              border: "2px solid var(--surface)",
            }}
          />
        </div>

        {/* labels */}
        <div
          style={{
            position: "relative",
            height: 16,
            marginTop: 6,
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          <div style={{ position: "absolute", left: 0 }}>
            -{model.RANGE}%
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            0%
          </div>
          <div style={{ position: "absolute", right: 0 }}>
            +{model.RANGE}%
          </div>
        </div>
      </div>
    </div>
  );
}
