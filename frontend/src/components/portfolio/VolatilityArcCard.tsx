import { useEffect, useMemo, useRef, useState } from "react";
import type { HistoryPoint, AssetAmounts } from "../../services/portfolio/portfolioService";

/* =========================
   Helpers
========================= */

function calcPortfolioValue(p: HistoryPoint, amounts: AssetAmounts) {
  let total = 0;

  for (const [symbol, amount] of Object.entries(amounts)) {
    const price = p.prices[symbol] ?? 0;
    total += price * amount;
  }

  return total;
}

function computeStats(history: HistoryPoint[], amounts: AssetAmounts) {
  if (history.length < 2) {
    return { volatility: 0, minVol: 0, maxVol: 0, avgMove: 0, stdDev: 0 };
  }

  const vals = history
    .map((p) => calcPortfolioValue(p, amounts))
    .filter((v) => Number.isFinite(v) && v > 0);

  if (vals.length < 2) {
    return { volatility: 0, minVol: 0, maxVol: 0, avgMove: 0, stdDev: 0 };
  }

  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);
  const avg = vals.reduce((s, x) => s + x, 0) / vals.length || 1;

  const volatilityRange = ((maxVal - minVal) / avg) * 100;

  const minPct = ((minVal - avg) / avg) * 100;
  const maxPct = ((maxVal - avg) / avg) * 100;

  const avgMoveCalc =
    vals
      .slice(1)
      .reduce((s, v, i) => s + Math.abs(v - vals[i]), 0) /
    (vals.length - 1);

  const avgMovePct = (avgMoveCalc / avg) * 100;

  const variance = vals.reduce((s, v) => s + (v - avg) ** 2, 0) / vals.length;
  const std = Math.sqrt(variance);
  const stdDevPct = (std / avg) * 100;

  return {
    volatility: volatilityRange,
    minVol: minPct,
    maxVol: maxPct,
    avgMove: avgMovePct,
    stdDev: stdDevPct,
  };
}

/* =========================
   Types
========================= */

type Props = {
  history: HistoryPoint[]; // уже filteredHistory
  amounts: AssetAmounts;
};

type Stats = {
  volatility: number;
  minVol: number;
  maxVol: number;
  avgMove: number;
  stdDev: number;
};

/* =========================
   Component
========================= */

export function VolatilityArcCard({ history, amounts }: Props) {
  // "истина" (новые значения при смене периода)
  const nextStats = useMemo<Stats>(() => computeStats(history, amounts), [history, amounts]);

  // то, что реально отображаем в цифрах (анимируем fade)
  const [displayStats, setDisplayStats] = useState<Stats>(nextStats);

  // дуга анимируется отдельно: обновляем сразу
  const [arcVolatility, setArcVolatility] = useState<number>(nextStats.volatility);

  // фаза для fade цифр
  const [fadePhase, setFadePhase] = useState<"in" | "out">("in");

  // signature, чтобы понимать "переключили период"
  const signature = useMemo(() => {
    const first = history[0]?.timestamp ?? 0;
    const last = history[history.length - 1]?.timestamp ?? 0;

    const amountsKey = Object.entries(amounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join("|");

    return `${history.length}:${first}:${last}:${amountsKey}`;
  }, [history, amounts]);

  const prevSigRef = useRef<string>(signature);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevSigRef.current === signature) return;
    prevSigRef.current = signature;

    // 1) дуга — сразу, sweep-анимация
    setArcVolatility(nextStats.volatility);

    // 2) цифры — плавно тухнут → обновляем → плавно появляются
    setFadePhase("out");

    if (timerRef.current) window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      setDisplayStats(nextStats);
      setFadePhase("in");
      timerRef.current = null;
    }, 180);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [signature, nextStats]);

  /* =========================
     Arc math
  ========================= */

  const pct = Math.min(Math.max(arcVolatility / 120, 0), 1);

  const radius = 100;
  const circumference = Math.PI * radius;
  const filled = pct * circumference;
  const empty = circumference - filled;

  const TEXT_PRIMARY = "#EFEFEF";
  const TEXT_SECONDARY = "rgba(255,255,255,0.75)";

  return (
    <div
      className="card vola-card"
      style={{
        borderRadius: "10px",
        height: "100%",
        width: "100%",
      }}
    >
      <style>{`
        .vola-card {
          will-change: opacity, transform;
          transition: opacity 220ms ease, transform 220ms ease;
        }

        .vola-fade {
          transition: opacity 220ms ease, filter 220ms ease;
          will-change: opacity, filter;
        }

        .vola-fade.out {
          opacity: 0;
          filter: blur(2px);
        }

        .vola-fade.in {
          opacity: 1;
          filter: blur(0px);
        }

        /* ДУГА: отдельная анимация (другая длительность/easing) */
        .vola-arc {
          transition: stroke-dasharray 900ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: stroke-dasharray;
        }
      `}</style>

      <div
        className="card-body"
        style={{
          display: "flex",
          gap: "28px",
          alignItems: "center",
          paddingTop: 20,
          paddingBottom: 20,
        }}
      >
        {/* ======================= GAUGE ======================= */}
        <div style={{ flex: "0 0 260px" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <svg width="260" height="170" viewBox="0 0 260 170">
              <defs>
                <linearGradient id="volaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>

              {/* Background arc */}
              <path
                d="M30 120 A100 100 0 0 1 230 120"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="16"
                fill="none"
              />

              {/* Foreground arc (sweep animation) */}
              <path
                className="vola-arc"
                d="M30 120 A100 100 0 0 1 230 120"
                stroke="url(#volaGradient)"
                strokeWidth="16"
                fill="none"
                strokeDasharray={`${filled} ${empty}`}
                strokeLinecap="round"
              />

              {/* Percentage (fade) */}
              <text
                x="130"
                y="108"
                fill={TEXT_PRIMARY}
                fontSize="28"
                fontWeight="700"
                dominantBaseline="middle"
                textAnchor="middle"
                className={`vola-fade ${fadePhase}`}
              >
                {displayStats.volatility.toFixed(2)}%
              </text>

              {/* Low / High */}
              <text x="12" y="155" fill={TEXT_PRIMARY} fontSize="15" fontWeight="600" textAnchor="start">
                Low
              </text>

              <text x="248" y="155" fill={TEXT_PRIMARY} fontSize="15" fontWeight="600" textAnchor="end">
                High
              </text>
            </svg>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 8,
              fontSize: 15,
              color: TEXT_SECONDARY,
            }}
          >
            Period Range Volatility
          </div>
        </div>

        {/* ======================= ANALYTICS ======================= */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            paddingLeft: "32px",
            flex: 1,
            color: TEXT_PRIMARY,
            fontSize: "15px",
          }}
        >
          <div
            style={{
              marginBottom: "6px",
              opacity: 0.9,
              fontWeight: 600,
              fontSize: "16px",
            }}
          >
            Analytics
          </div>

          {[
            { label: "Min", value: displayStats.minVol },
            { label: "Max", value: displayStats.maxVol },
            { label: "Avg Abs Move", value: displayStats.avgMove },
            { label: "Std Dev", value: displayStats.stdDev },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                paddingBottom: "6px",
                paddingTop: "4px",
              }}
            >
              <span style={{ opacity: 0.75 }}>{m.label}</span>

              <span
                className={`vola-fade ${fadePhase}`}
                style={{
                  fontFamily: "monospace",
                  opacity: 0.95,
                }}
              >
                {m.value.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
