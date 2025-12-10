import { useEffect, useRef } from "react";
import * as echarts from "echarts";

import {
  buildPortfolioSeries,
  filterHistoryByPeriod,
} from "../../services/portfolioService";

import type { HistoryPoint, Period } from "../../services/portfolioService";

import { buildPortfolioChartOption } from "../../charts/portfolioChartOptions";

type Props = {
  history: HistoryPoint[];
  period: Period;
  onPeriodChange: (p: Period) => void;
};

export function PortfolioChartCard({
  history,
  period,
  onPeriodChange,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const seriesCounterRef = useRef(0);
  const seriesIdRef = useRef("portfolio-line-0");

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

  // Update chart (анимация как раньше)
  useEffect(() => {
    const chart = chartInstance.current;
    if (!chart) return;

    const filteredHistory = filterHistoryByPeriod(history, period);
    const { timestamps, percentValues } =
      buildPortfolioSeries(filteredHistory, period);

    if (!percentValues.length) return;

    const option = buildPortfolioChartOption(timestamps, percentValues, {
      seriesId: seriesIdRef.current,
      initial: true, // всегда проигрываем "первичную" анимацию линии
      opacity: 1,
    });

    chart.setOption(option, {
      notMerge: true,   // создаём новую серию
      lazyUpdate: true,
      silent: true,
    });
  }, [history, period]);

  // Переключение табов — только смена id серии + периода
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

      {/* Tabs */}
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

      {/* Chart без внешнего fade/blur */}
      <div style={{ width: "100%", height: "350px" }}>
        <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
