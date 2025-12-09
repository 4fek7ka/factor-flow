import React, { useEffect, useRef, useMemo } from "react";
import * as echarts from "echarts";
import type { HistoryPoint } from "../services/portfolioService";

const ASSET_COLORS: Record<string, string> = {
  ETH: "#8A7FFF",
  WBTC: "#FFB45A",
  USDC: "#5DA7FF",
  DAI: "#FFD86B",
  UNI: "#FF6F9E",
};

const AMOUNTS = {
  ETH: 2,
  WBTC: 0.03,
  USDC: 80,
  DAI: 40,
  UNI: 400,
};

type Props = {
  history: HistoryPoint[];
};

export function PortfolioAllocation({ history }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.ECharts | null>(null);

  // ============================
  // 📌 Расчёт распределения
  // ============================
  const allocation = useMemo(() => {
    if (!history.length) return [];

    const last = history[history.length - 1];

    const values = Object.entries(AMOUNTS).map(([symbol, amount]) => {
      const price = last.prices[symbol as keyof typeof last.prices];
      const valueUsd = price * amount;
      return { symbol, valueUsd };
    });

    const total = values.reduce((s, v) => s + v.valueUsd, 0);

    return values.map((v) => ({
      ...v,
      pct: total ? (v.valueUsd / total) * 100 : 0,
    }));
  }, [history]);

  // ============================
  // 📌 Donut
  // ============================
  useEffect(() => {
    if (!chartRef.current) return;

    chart.current = echarts.init(chartRef.current);
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
          data: allocation.map((a) => ({
            value: a.valueUsd,
            name: a.symbol,
            itemStyle: { color: ASSET_COLORS[a.symbol] },
          })),
        },
      ],
    };

    inst.setOption(option);
    const ro = new ResizeObserver(() => inst.resize());
    ro.observe(chartRef.current);

    return () => {
      ro.disconnect();
      inst.dispose();
    };
  }, [allocation]);

  if (!allocation.length) return null;

  return (
    <div
      className="card mt-3"
      style={{
        maxWidth: "620px",
        borderRadius: "10px",
      }}
    >
      <div
        className="card-body"
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "center",
        }}
      >
        {/* Donut */}
        <div
          ref={chartRef}
          style={{
            width: "190px",
            height: "190px",
            flexShrink: 0,
          }}
        />

        {/* Legend */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            width: "100%",
          }}
        >
          {/* Заголовок */}
          <h4
            style={{
              margin: 0,
              fontSize: "20px",      // ещё немного крупнее
              color: "#FAFAFA",       // почти белый, но не режет глаза
              fontWeight: 600,
              letterSpacing: "0.2px",
            }}
          >
            Portfolio Allocation
          </h4>

          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "18px 110px 110px 70px",
              fontSize: "14px",       // чуть крупнее
              color: "#E8E8E8",       // светло-серый ближе к белому
              paddingBottom: "6px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              fontWeight: 500,
            }}
          >
            <div></div>
            <div>Asset</div>
            <div>Value</div>
            <div style={{ textAlign: "right" }}>Share</div>
          </div>

          {/* Rows */}
          {allocation.map((a) => (
            <div
              key={a.symbol}
              style={{
                display: "grid",
                gridTemplateColumns: "18px 110px 110px 70px",
                alignItems: "center",
                fontSize: "15px",        // весь текст чуть крупнее
                color: "#EFEFEF",         // светлее чем раньше
              }}
            >
              {/* dot */}
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: ASSET_COLORS[a.symbol],
                  justifySelf: "center",
                }}
              />

              {/* name */}
              <div style={{ fontWeight: 500 }}>{a.symbol}</div>

              {/* value */}
              <div>${a.valueUsd.toFixed(0)}</div>

              {/* percentage */}
              <div
                style={{
                  textAlign: "right",
                  fontWeight: 500,
                  color: "#EFEFEF",
                }}
              >
                {a.pct.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
