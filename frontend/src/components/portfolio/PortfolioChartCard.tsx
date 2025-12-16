import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

import {
  buildPortfolioSeries,
  filterHistoryByPeriod,
  type AssetAmounts,
} from "../../services/portfolio/portfolioService";

import type { HistoryPoint, Period } from "../../services/portfolio/portfolioService";
import { buildPortfolioChartOption } from "../../charts/portfolioChartOptions";

type Props = {
  history: HistoryPoint[];
  period: Period;
  onPeriodChange: (p: Period) => void;
  amounts: AssetAmounts;
};

export function PortfolioChartCard({
  history,
  period,
  onPeriodChange,
  amounts,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const seriesCounterRef = useRef(0);
  const seriesIdRef = useRef("portfolio-line-0");

  const [showBTC, setShowBTC] = useState(false);

  // Init chart
  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current, "dark");
    const chart = chartInstance.current;

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(chartRef.current);

    return () => {
      observer.disconnect();
      chart.dispose();
      chartInstance.current = null;
    };
  }, []);

  // Update chart
  useEffect(() => {
    const chart = chartInstance.current;
    if (!chart) return;

    const filteredHistory = filterHistoryByPeriod(history, period);

    const { timestamps, percentValues } = buildPortfolioSeries(
      filteredHistory,
      period,
      amounts
    );

    if (!percentValues.length) return;

    const option: any = buildPortfolioChartOption(timestamps, percentValues, {
      seriesId: seriesIdRef.current,
      initial: true,
      opacity: 1,
    });

    if (showBTC) {
      // timestamps в графике — ms, а в history — seconds → приводим к ms
      const btcByTsMs = new Map<number, number>();
      for (const p of filteredHistory) {
        const v = p.prices?.BTC ?? p.prices?.WBTC; // fallback, если вдруг BTC отсутствует
        if (typeof v === "number") btcByTsMs.set(p.timestamp * 1000, v);
      }

      const btcPrices: Array<number | null> = timestamps.map((tsMs: number) => {
        const v = btcByTsMs.get(tsMs);
        return typeof v === "number" ? v : null;
      });

      const base = btcPrices.find((v) => typeof v === "number") as number | undefined;

      if (typeof base === "number") {
        const btcPercent: Array<number | null> = btcPrices.map((v) =>
          v == null ? null : ((v - base) / base) * 100
        );

        const btcData: Array<[number, number | null]> = timestamps.map(
          (tsMs: number, i: number) => [tsMs, btcPercent[i]]
        );

        const baseSeries = Array.isArray(option.series) ? option.series : [option.series];

        baseSeries.push({
          id: "btc-line",
          name: "BTC",
          type: "line",
          data: btcData,
          smooth: false,
          showSymbol: false,
          lineStyle: {
            width: 2,
            type: "dashed",
            color: "#f7931a",
          },
          areaStyle: undefined,
          emphasis: { disabled: true },
          animation: false,
        });

        option.series = baseSeries;
      }
    }

    chart.setOption(option, {
      notMerge: true,
      lazyUpdate: true,
      silent: true,
    });
  }, [history, period, amounts, showBTC]);

  const switchPeriod = (next: Period) => {
    if (next === period) return;

    seriesCounterRef.current += 1;
    seriesIdRef.current = `portfolio-line-${seriesCounterRef.current}`;

    onPeriodChange(next);
  };

  const tabClass = (key: Period) =>
    `period-tab ${period === key ? "active" : ""}`;

  return (
    <div className="card p-3">
      <style>{`
        .chart-top-row {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-bottom: 6px;
        }

        .btc-toggle {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #9ca3af;
          cursor: pointer;
          user-select: none;
        }

        .btc-toggle input {
          accent-color: #f7931a;
        }

        .period-tabs-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
        }

        .period-tabs {
          display: flex;
          gap: 28px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          position: relative;
          padding-bottom: 4px;
        }

        .period-tab {
          background: none;
          border: none;
          padding: 8px 2px;
          color: #9ca3af;
          font-size: 16px;
          cursor: pointer;
          position: relative;
          transition: color 200ms ease;
        }

        .period-tab:hover {
          color: #d1d5db;
        }

        .period-tab.active {
          color: #b351f9;
        }

        .period-underline {
          position: absolute;
          bottom: -1px;
          height: 2px;
          background: #b351f9;
          border-radius: 2px;
          transition: transform 320ms cubic-bezier(0.25, 0.1, 0.25, 1),
                      width 320ms cubic-bezier(0.25, 0.1, 0.25, 1);
        }
      `}</style>

      <div className="chart-top-row">
        <label className="btc-toggle">
          <input
            type="checkbox"
            checked={showBTC}
            onChange={(e) => setShowBTC(e.currentTarget.checked)}
          />
          BTC
        </label>
      </div>

      <div className="period-tabs-wrap">
        <div className="period-tabs">
          <div
            className="period-underline"
            style={{
              width: period === "year" ? 36 : period === "month" ? 52 : 44,
              transform:
                period === "year"
                  ? "translateX(0px)"
                  : period === "month"
                  ? "translateX(64px)"
                  : "translateX(144px)",
            }}
          />

          <button className={tabClass("year")} onClick={() => switchPeriod("year")}>
            Year
          </button>

          <button className={tabClass("month")} onClick={() => switchPeriod("month")}>
            Month
          </button>

          <button className={tabClass("week")} onClick={() => switchPeriod("week")}>
            Week
          </button>
        </div>
      </div>

      <div style={{ width: "100%", height: "350px" }}>
        <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
