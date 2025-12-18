import { useEffect, useRef } from "react";
import * as echarts from "echarts";

import { buildPortfolioSeries } from "../../services/portfolio/portfolioService";
import type {
  HistoryPoint,
  Period,
} from "../../services/portfolio/portfolioService";

import { buildPortfolioChartOption } from "../../charts/portfolioChartOptions";

type Props = {
  history: HistoryPoint[];
  period: Period;
};

/**
 * PortfolioChart
 * - always uses brand accent color
 * - no red/green logic
 * - typesafe (no changes to ChartParams)
 */
export function PortfolioChart({ history, period }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

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

  useEffect(() => {
    const chart = chartInstance.current;
    if (!chart) return;

    const { timestamps, percentValues } = buildPortfolioSeries(history, period);
    if (!percentValues.length) return;

    const option: any = buildPortfolioChartOption(
      timestamps,
      percentValues,
      {
        initial: true,
        opacity: 1,
      }
    );

    // 🔒 FORCE ACCENT COLOR (safe & local)
    if (Array.isArray(option.series)) {
      option.series = option.series.map((s: any) => ({
        ...s,
        lineStyle: {
          ...(s.lineStyle ?? {}),
          color: "var(--primary)",
          width: 2,
        },
        itemStyle: {
          ...(s.itemStyle ?? {}),
          color: "var(--primary)",
        },
        areaStyle: s.areaStyle
          ? {
              ...s.areaStyle,
              color: "rgba(139,92,246,0.18)", // soft accent fill
            }
          : undefined,
      }));
    }

    chart.setOption(option, {
      notMerge: true,
      lazyUpdate: true,
      silent: true,
    });
  }, [history, period]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: "350px",
      }}
    />
  );
}
