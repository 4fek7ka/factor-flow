import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import history from "../data/mock-history.json";
import { buildPortfolioSeries } from "../services/portfolioService";
import { buildPortfolioChartOption } from "../charts/portfolioChartOptions";

export function PortfolioChart() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, "dark");

    const { timestamps, percentValues } = buildPortfolioSeries(history);
    if (!percentValues.length) return;

    const option = buildPortfolioChartOption(timestamps, percentValues);
    chart.setOption(option);

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(chartRef.current);

    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height: "350px" }} />;
}
