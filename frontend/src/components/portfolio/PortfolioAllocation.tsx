import { useEffect, useRef, useMemo } from "react";
import * as echarts from "echarts";

import type {
  AssetAmounts,
  HistoryPoint,
} from "../../services/portfolio/portfolioService";

const ASSET_COLORS: Record<string, string> = {
  ETH: "#8A7FFF",
  BTC: "#FFB45A",
  WBTC: "#FFB45A",
  USDC: "#5DA7FF",
  USDT: "#2BB673",
  DAI: "#FFD86B",
  UNI: "#FF6F9E",
  SOL: "#66E0FF",
  BNB: "#F3BA2F",
  ADA: "#3CC8C8",
  XRP: "#7C89FF",
  DOGE: "#C2A633",
  AVAX: "#E84142",
  LINK: "#2A5ADA",
  TON: "#4AA8FF",
  Others: "#6B7280",
};

type Props = {
  history: HistoryPoint[];
  amounts: AssetAmounts;
};

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
    if (othersTotal > 0) {
      finalList.push({ symbol: "Others", valueUsd: othersTotal });
    }

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
          radius: ["55%", "78%"],
          center: ["50%", "50%"],
          label: { show: false },
          labelLine: { show: false },
          minAngle: 2,
          data: allocation.map((a) => ({
            value: a.valueUsd,
            name: a.symbol,
            itemStyle: { color: ASSET_COLORS[a.symbol] ?? "#6B7280" },
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
    <div className="card p-3" style={{ width: "100%" }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
        Portfolio Allocation
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 14 }}>
        <div style={{ height: 220 }}>
          <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "14px 1fr 1fr 60px",
              gap: 10,
              alignItems: "center",
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              marginBottom: 4,
            }}
          >
            <div />
            <div>Asset</div>
            <div>Value</div>
            <div style={{ textAlign: "right" }}>%</div>
          </div>

          {allocation.map((a) => (
            <div
              key={a.symbol}
              style={{
                display: "grid",
                gridTemplateColumns: "14px 1fr 1fr 60px",
                gap: 10,
                alignItems: "center",
                padding: "8px 10px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: ASSET_COLORS[a.symbol] ?? "#6B7280",
                  justifySelf: "center",
                }}
              />

              <div style={{ fontWeight: 500 }}>{a.symbol}</div>
              <div>${a.valueUsd.toFixed(0)}</div>

              <div style={{ textAlign: "right", fontWeight: 500, color: "#EFEFEF" }}>
                {a.pct.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
