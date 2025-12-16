import { useMemo } from "react";
import type { HistoryPoint } from "../../services/portfolio/portfolioService";

function calcPortfolioValue(p: HistoryPoint) {
  const AMOUNTS = { ETH: 2, WBTC: 0.03, USDC: 80, DAI: 40, UNI: 400 };
  return (
    p.prices.ETH * AMOUNTS.ETH +
    p.prices.WBTC * AMOUNTS.WBTC +
    p.prices.USDC * AMOUNTS.USDC +
    p.prices.DAI * AMOUNTS.DAI +
    p.prices.UNI * AMOUNTS.UNI
  );
}

type Props = {
  history: HistoryPoint[];
};

export function VolatilityArcCard({ history }: Props) {
  const {
    volatility,
    minVol,
    maxVol,
    avgMove,
    stdDev,
  } = useMemo(() => {
    if (history.length < 24 * 7) {
      return {
        volatility: 0,
        minVol: 0,
        maxVol: 0,
        avgMove: 0,
        stdDev: 0,
      };
    }

    const points = 24 * 7;
    const lastWeek = history.slice(-points);

    const vals = lastWeek.map(calcPortfolioValue);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const avg = vals.reduce((s, x) => s + x, 0) / vals.length || 1;

    const volatilityRange = ((maxVal - minVal) / avg) * 100;

    const minPct = ((minVal - avg) / avg) * 100;
    const maxPct = ((maxVal - avg) / avg) * 100;

    const avgMoveCalc =
      vals.length > 1
        ? vals
            .slice(1)
            .reduce((s, v, i) => s + Math.abs(v - vals[i]), 0) /
          (vals.length - 1)
        : 0;

    const avgMovePct = (avgMoveCalc / avg) * 100;

    const std =
      vals.length > 1
        ? Math.sqrt(
            vals.map((v) => Math.pow(v - avg, 2)).reduce((a, b) => a + b, 0) /
              vals.length
          )
        : 0;

    const stdDevPct = (std / avg) * 100;

    return {
      volatility: volatilityRange,
      minVol: minPct,
      maxVol: maxPct,
      avgMove: avgMovePct,
      stdDev: stdDevPct,
    };
  }, [history]);

  // ---- arc math ----
  const pct = Math.min(Math.max(volatility / 40, 0), 1); // 0..1

  const radius = 100;
  const circumference = Math.PI * radius;
  const filled = pct * circumference;
  const empty = circumference - filled;

  const TEXT_PRIMARY = "#EFEFEF";
  const TEXT_SECONDARY = "rgba(255,255,255,0.75)";

  return (
    <div
      className="card"
      style={{
        borderRadius: "10px",
        height: "100%",
        width: "100%",
      }}
    >
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

              {/* ---- DEFINING GRADIENT ---- */}
              <defs>
                <linearGradient id="volaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#22c55e" />  {/* green */}
                  <stop offset="50%"  stopColor="#eab308" />  {/* yellow */}
                  <stop offset="100%" stopColor="#ef4444" />  {/* red */}
                </linearGradient>
              </defs>

              {/* Background arc */}
              <path
                d="M30 120 A100 100 0 0 1 230 120"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="16"
                fill="none"
              />

              {/* Foreground arc — GRADIENT */}
              <path
                d="M30 120 A100 100 0 0 1 230 120"
                stroke="url(#volaGradient)"
                strokeWidth="16"
                fill="none"
                strokeDasharray={`${filled} ${empty}`}
                strokeLinecap="round"
              />

              {/* Percentage */}
              <text
                x="130"
                y="108"
                fill={TEXT_PRIMARY}
                fontSize="28"
                fontWeight="700"
                dominantBaseline="middle"
                textAnchor="middle"
              >
                {volatility.toFixed(2)}%
              </text>

              {/* Low */}
              <text
                x="12"
                y="155"
                fill={TEXT_PRIMARY}
                fontSize="15"
                fontWeight="600"
                textAnchor="start"
              >
                Low
              </text>

              {/* High */}
              <text
                x="248"
                y="155"
                fill={TEXT_PRIMARY}
                fontSize="15"
                fontWeight="600"
                textAnchor="end"
              >
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
            7D Range Volatility
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
            { label: "Min", value: minVol },
            { label: "Max", value: maxVol },
            { label: "Avg Abs Move", value: avgMove },
            { label: "Std Dev (7D)", value: stdDev },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom:
                  i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                paddingBottom: "6px",
                paddingTop: "4px",
              }}
            >
              <span style={{ opacity: 0.75 }}>{m.label}</span>
              <span
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
