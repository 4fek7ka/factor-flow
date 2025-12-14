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

  const COLOR = model.isPositive ? "#22c55e" : "#ef4444";
  const sign = model.deltaPct >= 0 ? "+" : "";
  const deltaText = `${sign}${model.deltaPct.toFixed(1)}%`;

  // центр шкалы
  const centerPct = 50;

  // параметры заливки
  const fillLeft = model.isPositive ? centerPct : model.posPct;
  const fillWidth = Math.abs(model.posPct - centerPct);

  return (
    <div
      className="card card-sm w-100"
      style={{
        background: "#0f172a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="card-body">
        <div
          style={{
            fontWeight: 700,
            color: "rgba(226,232,240,0.95)",
            marginBottom: 10,
          }}
        >
          Final outcome
        </div>

        {/* PRICE + PERCENT */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            marginBottom: 14,
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "rgba(226,232,240,0.95)",
              lineHeight: "28px",
            }}
          >
            {formatMoney(median)}
          </div>

          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: COLOR,
              lineHeight: "28px",
            }}
          >
            {deltaText}
          </div>
        </div>

        {/* === DELTA SCALE === */}
        <div style={{ position: "relative", height: 20 }}>
          {/* base line */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 7,
              transform: "translateY(-50%)",
              borderRadius: 999,
              background: "rgba(255,255,255,0.22)",
            }}
          />

          {/* filled progress from center */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${fillLeft}%`,
              width: `${fillWidth}%`,
              height: 7,
              transform: "translateY(-50%)",
              borderRadius: 999,
              background: model.isPositive
                ? "rgba(34,197,94,0.55)"
                : "rgba(239,68,68,0.55)",
            }}
          />

          {/* zero marker */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-1px, -50%)",
              width: 2,
              height: 14,
              background: "rgba(226,232,240,0.78)",
            }}
          />

          {/* marker */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${model.posPct}%`,
              transform: "translate(-50%, -50%)",
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: COLOR,
              border: "1px solid rgba(148,163,184,0.65)",
              boxShadow:
                model.isPositive
                  ? "0 0 9px rgba(34,197,94,0.25)"
                  : "0 0 9px rgba(239,68,68,0.25)",
            }}
          />
        </div>

        {/* scale labels */}
        <div
          style={{
            position: "relative",
            height: 16,
            marginTop: 6,
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(148,163,184,0.95)",
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
