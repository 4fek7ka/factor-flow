import { useEffect, useRef } from "react";
import * as echarts from "echarts";

import { buildPortfolioSeries } from "../../services/portfolio/portfolioService";
import type { HistoryPoint, Period } from "../../services/portfolio/portfolioService";

import { buildPortfolioChartOption } from "../../charts/portfolioChartOptions";

type Props = {
  history: HistoryPoint[];
  period: Period;
};

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

    const option = buildPortfolioChartOption(timestamps, percentValues, {
      initial: true,
      opacity: 1,
    });

    chart.setOption(option, { notMerge: true, lazyUpdate: false });
  }, [history, period]);

  return <div ref={chartRef} style={{ width: "100%", height: "350px" }} />;
}
