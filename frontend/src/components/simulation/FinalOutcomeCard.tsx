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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
            flexWrap: "nowrap",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "rgba(226,232,240,0.95)",
              lineHeight: 1.2,
            }}
          >
            {formatMoney(median)}
          </div>

          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: COLOR,
              lineHeight: 1,
              whiteSpace: "nowrap",
              paddingTop: 2,
            }}
          >
            {deltaText}
          </div>
        </div>

        {/* === DELTA SCALE === */}
        <div style={{ position: "relative", height: 20 }}>
          {/* 
            👇 ТОЛЩИНА ОСНОВНОЙ ЛИНИИ РЕГУЛИРУЕТСЯ ЗДЕСЬ
            height: 7  ← было 8, стало ещё чуть тоньше
          */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 7, // ← ТОЛЩИНА ЛИНИИ
              transform: "translateY(-50%)",
              borderRadius: 999,
              background: "rgba(255,255,255,0.22)",
              boxShadow: "0 0 8px rgba(255,255,255,0.06)",
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
                  ? "0 0 9px rgba(34,197,94,0.2)"
                  : "0 0 9px rgba(239,68,68,0.2)",
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
          <div style={{ position: "absolute", left: 0, top: 0 }}>
            -{model.RANGE}%
          </div>

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              transform: "translateX(-50%)",
              width: 40,
              textAlign: "center",
            }}
          >
            0%
          </div>

          <div style={{ position: "absolute", right: 0, top: 0 }}>
            +{model.RANGE}%
          </div>
        </div>
      </div>
    </div>
  );
}
