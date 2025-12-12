// src/components/simulation/SimulationChartCard.tsx

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { TooltipComponent, GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([LineChart, TooltipComponent, GridComponent, CanvasRenderer]);

export type SimulationChartCardProps = {
  timestamps: number[]; // 0..N
  median: number[];
  upper: number[];      // прямая линия сверху (по интерполяции)
  lower: number[];      // прямая линия снизу (по интерполяции)
  cloud: number[][];
  showCloud: boolean;
};

export function SimulationChartCard({
  timestamps,
  median,
  upper,
  lower,
  cloud,
  showCloud,
}: SimulationChartCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const chart = echarts.init(ref.current);

    // Облако симуляций
    const cloudSeries = showCloud
      ? cloud.map((path, idx) => ({
          type: "line" as const,
          name: `Path ${idx + 1}`,
          data: timestamps.map((t, i) => [t, path[i]]),
          showSymbol: false,
          lineStyle: {
            width: 1,
            opacity: 0.12,
            color: "#94a3b8",
          },
          silent: true,
          animation: false,
          z: 1,
        }))
      : [];

    // Верхняя граница — прямая линия
    const upperSeries = {
      type: "line" as const,
      name: "Upper",
      data: timestamps.map((t, i) => [t, upper[i]]),
      showSymbol: false,
      lineStyle: {
        width: 2,
        color: "#22c55e",
      },
      animation: false,
      z: 5,
    };

    // Нижняя граница — прямая линия
    const lowerSeries = {
      type: "line" as const,
      name: "Lower",
      data: timestamps.map((t, i) => [t, lower[i]]),
      showSymbol: false,
      lineStyle: {
        width: 2,
        color: "#ef4444",
      },
      animation: false,
      z: 5,
    };

    // Основная "живая" траектория
    const medianSeries = {
      type: "line" as const,
      name: "Median",
      data: timestamps.map((t, i) => [t, median[i]]),
      showSymbol: false,
      lineStyle: {
        width: 3,
        color: "#0ea5e9",
      },
      z: 10,
      animationDuration: 600,
    };

    const lastTs = timestamps.length > 0 ? timestamps[timestamps.length - 1] : 0;

    const option = {
      backgroundColor: "transparent",

      tooltip: {
        trigger: "axis",
        valueFormatter: (v: number) => v.toFixed(2),
      },

      grid: {
        left: 40,
        right: 24,
        top: 20,
        bottom: 40,
      },

      xAxis: {
        type: "value" as const,
        min: 0,
        max: lastTs,
        boundaryGap: false,
        axisLabel: {
          color: "#64748b",
          formatter: (v: number) => `${Math.round(v)}d`,
        },
        axisLine: { lineStyle: { color: "#334155" } },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },

      yAxis: {
        type: "value" as const,
        axisLabel: { color: "#94a3b8" },
        axisLine: { lineStyle: { color: "#334155" } },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },

      series: [
        ...cloudSeries,
        upperSeries,
        lowerSeries,
        medianSeries,
      ],
    };

    chart.setOption(option);

    const resizeHandler = () => chart.resize();
    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
      chart.dispose();
    };
  }, [timestamps, median, upper, lower, cloud, showCloud]);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: 380,
      }}
    />
  );
}
