import { useEffect, useRef, useMemo } from "react";
import * as echarts from "echarts";

import type { AssetAmounts, HistoryPoint } from "../../services/portfolio/portfolioService";

/**
 * Asset colors tuned to match the purple/cyan dark theme.
 * Goal: cohesive “designer” palette (not a random rainbow),
 * while keeping BTC/ETH recognisable.
 */
const ASSET_COLORS: Record<string, string> = {
  // Core
  ETH: "#8B5CF6", // violet
  BTC: "#F59E0B", // warm amber (still “BTC-ish”, but fits theme)
  WBTC: "#F59E0B",

  // Stables
  USDC: "#38BDF8", // sky/cyan
  USDT: "#2DD4BF", // teal
  DAI: "#FDE047", // soft warm yellow

  // Majors / alts (kept within purple/blue/cyan/rose range)
  SOL: "#22D3EE",
  BNB: "#FBBF24",
  ADA: "#60A5FA",
  XRP: "#93C5FD",
  LINK: "#7C3AED",
  UNI: "#FB7185",
  DOGE: "#FBBF24",
  AVAX: "#FB7185",
  TON: "#38BDF8",

  Others: "rgba(255,255,255,0.35)",
};

type Props = {
  history: HistoryPoint[];
  amounts: AssetAmounts;
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function hexToRgba(hex: string, alpha: number) {
  const a = clamp01(alpha);
  const h = hex.replace("#", "").trim();

  // support #RGB and #RRGGBB
  const full =
    h.length === 3
      ? `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`
      : h.padEnd(6, "0").slice(0, 6);

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  if (![r, g, b].every(Number.isFinite)) return `rgba(255,255,255,${a})`;
  return `rgba(${r},${g},${b},${a})`;
}

export function PortfolioAllocation({ history, amounts }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.ECharts | null>(null);

  const allocation = useMemo(() => {
    if (!history.length) return [];

    const last = history[history.length - 1];

    const values = Object.entries(amounts || {})
      .map(([symbol, amount]) => {
        const price = last.prices[symbol] ?? 0;
        const valueUsd = price * amount;
        return { symbol, valueUsd };
      })
      .filter((x) => Number.isFinite(x.valueUsd) && x.valueUsd > 0);

    if (!values.length) return [];

    const sorted = values.sort((a, b) => b.valueUsd - a.valueUsd);
    const top3 = sorted.slice(0, 3);

    const others = sorted.slice(3);
    const othersTotal = others.reduce((s, v) => s + v.valueUsd, 0);

    const finalList = [...top3];
    if (othersTotal > 0) finalList.push({ symbol: "Others", valueUsd: othersTotal });

    const total = finalList.reduce((s, v) => s + v.valueUsd, 0);

    return finalList.map((v) => ({
      ...v,
      pct: total ? (v.valueUsd / total) * 100 : 0,
    }));
  }, [history, amounts]);

  useEffect(() => {
    if (!chartRef.current) return;

    chart.current = echarts.init(chartRef.current);
    const inst = chart.current;

    const ro = new ResizeObserver(() => inst.resize());
    ro.observe(chartRef.current);

    return () => {
      ro.disconnect();
      inst.dispose();
      chart.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chart.current) return;
    if (!allocation.length) return;

    const inst = chart.current;

    const option = {
      backgroundColor: "transparent",
      series: [
        {
          type: "pie",
          radius: ["56%", "80%"],
          center: ["50%", "50%"],
          label: { show: false },
          labelLine: { show: false },
          minAngle: 2,
          itemStyle: {
            borderColor: "rgba(0,0,0,0.0)",
            borderWidth: 0,
          },
          data: allocation.map((a) => ({
            value: a.valueUsd,
            name: a.symbol,
            itemStyle: {
              color: ASSET_COLORS[a.symbol] ?? ASSET_COLORS.Others,
            },
          })),
        },
      ],
    };

    inst.setOption(option, {
      notMerge: true,
      lazyUpdate: true,
      silent: true,
    });
  }, [allocation]);

  return (
    <div className="card p-3 ff-card" style={{ width: "100%" }}>
      <style>{`
        .ff-card {
          background: var(--surface);
          border: 1px solid var(--border);
        }

        .ff-title {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 10px;
          letter-spacing: 0.2px;
        }

        .ff-header {
          color: rgba(255,255,255,0.70);
          font-size: 12.5px;
          letter-spacing: 0.2px;
        }

        .ff-row {
          display: grid;
          grid-template-columns: 14px 1fr 1fr 60px;
          gap: 10px;
          align-items: center;
          padding: 8px 10px;
          border-radius: 10px;

          background: var(--surface-hover);
          border: 1px solid var(--border);

          transition: background 180ms ease, border-color 180ms ease, transform 180ms ease;
        }

        .ff-row:hover {
          border-color: rgba(255,255,255,0.14);
          transform: translateY(-1px);
        }

        .ff-asset {
          color: rgba(255,255,255,0.92);
          font-weight: 600;
          letter-spacing: 0.2px;
        }

        .ff-usd {
          color: rgba(255,255,255,0.86);
          font-weight: 500;
        }

        .ff-pct {
          color: #fff;
          font-weight: 700;
        }
      `}</style>

      <div className="ff-title">Portfolio Allocation</div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 14 }}>
        {/* CHART */}
        <div style={{ height: 220 }}>
          <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
        </div>

        {/* TABLE */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            className="ff-header"
            style={{
              display: "grid",
              gridTemplateColumns: "14px 1fr 1fr 60px",
              gap: 10,
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <div />
            <div>Asset</div>
            <div>Value</div>
            <div style={{ textAlign: "right" }}>%</div>
          </div>

          {allocation.map((a) => {
            const c = ASSET_COLORS[a.symbol] ?? ASSET_COLORS.Others;

            // Subtle tint (designer touch): the row gets a very light “ink”
            // from the asset color, but still uses the theme surface.
            const tint =
              typeof c === "string" && c.startsWith("#") ? hexToRgba(c, 0.10) : "rgba(255,255,255,0.05)";

            return (
              <div
                key={a.symbol}
                className="ff-row"
                style={{
                  background: `linear-gradient(90deg, ${tint} 0%, var(--surface-hover) 55%, var(--surface-hover) 100%)`,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: c,
                    justifySelf: "center",
                  }}
                />

                <div className="ff-asset">{a.symbol}</div>

                <div className="ff-usd">${a.valueUsd.toFixed(0)}</div>

                <div className="ff-pct" style={{ textAlign: "right" }}>
                  {a.pct.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
