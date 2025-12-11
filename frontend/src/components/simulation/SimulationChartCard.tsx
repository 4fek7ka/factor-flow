// src/components/simulation/SimulationChartCard.tsx

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

import type { SimulationParams } from "./SimulationControls";
import type { MonteCarloInput } from "../../services/monteCarloService";

import {
  runMonteCarloSimple,
  runMonteCarloAdvanced,
} from "../../services/monteCarloService";

type Props = {
  mode: "simple" | "advanced";
  params: SimulationParams;
  startValue: number;
};

export function SimulationChartCard({ mode, params, startValue }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // INIT
  useEffect(() => {
    if (!chartRef.current) return;
    chartInstance.current = echarts.init(chartRef.current);
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  // UPDATE
  useEffect(() => {
    if (!chartInstance.current) return;

    const input: MonteCarloInput = {
      startValue,
      driftPct: params.driftPct,
      volatilityPct: params.volatilityPct,
      horizonDays: params.horizonDays,
      simulations: params.simulations,
    };

    if (mode === "simple") {
      const sim = runMonteCarloSimple(input);
      chartInstance.current.clear();
      chartInstance.current.setOption(buildSimpleOption(sim), true);
    } else {
      const sim = runMonteCarloAdvanced(input);
      chartInstance.current.clear();
      chartInstance.current.setOption(buildAdvancedOption(sim), true);
    }
  }, [mode, params, startValue]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: 420,
      }}
    />
  );
}

/* -------------------------------------------------------
   SIMPLE MODE OPTION
-------------------------------------------------------- */
function buildSimpleOption(sim: ReturnType<typeof runMonteCarloSimple>) {
  const { timestamps, median, upper, lower } = sim;

  return {
    backgroundColor: "transparent",
    animationDuration: 500,

    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const p = params[0];
        const v = p.value[1];
        return `<strong>${v.toFixed(2)}</strong>`;
      },
    },

    grid: {
      left: 40,
      right: 40,
      top: 20,
      bottom: 40,
    },

    xAxis: {
      type: "value",
      axisLabel: { color: "#8895a7" },
      axisLine: { lineStyle: { color: "#475569" } },
    },

    yAxis: {
      type: "value",
      axisLabel: { color: "#8895a7" },
      axisLine: { lineStyle: { color: "#475569" } },
      splitLine: { lineStyle: { color: "#1e293b" } },
    },

    series: [
      {
        type: "line",
        name: "Upper",
        data: timestamps.map((t, i) => [t, upper[i]]),
        smooth: false,
        showSymbol: false,
        lineStyle: { width: 2, color: "#22c55e" },
        opacity: 0.5,
      },
      {
        type: "line",
        name: "Lower",
        data: timestamps.map((t, i) => [t, lower[i]]),
        smooth: false,
        showSymbol: false,
        lineStyle: { width: 2, color: "#ef4444" },
        opacity: 0.5,
      },
      {
        type: "line",
        name: "Median",
        data: timestamps.map((t, i) => [t, median[i]]),
        smooth: false,
        showSymbol: false,
        lineStyle: { width: 3, color: "#38bdf8" },
      },
    ],
  };
}

/* -------------------------------------------------------
   ADVANCED MODE OPTION
-------------------------------------------------------- */
function buildAdvancedOption(sim: ReturnType<typeof runMonteCarloAdvanced>) {
  const { timestamps, paths, median, p10, p90 } = sim;

  const pathSeries = paths.map((path) => ({
    type: "line",
    data: timestamps.map((t, i) => [t, path[i]]),
    smooth: false,
    showSymbol: false,
    lineStyle: {
      width: 1,
      color: "rgba(56,189,248,0.15)",
    },
    animation: false,
  }));

  return {
    backgroundColor: "transparent",

    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const p = params[0];
        const v = p.value[1];
        return `<strong>${v.toFixed(2)}</strong>`;
      },
    },

    grid: {
      left: 40,
      right: 40,
      top: 20,
      bottom: 40,
    },

    xAxis: {
      type: "value",
      axisLabel: { color: "#8895a7" },
      axisLine: { lineStyle: { color: "#475569" } },
    },

    yAxis: {
      type: "value",
      axisLabel: { color: "#8895a7" },
      axisLine: { lineStyle: { color: "#475569" } },
      splitLine: { lineStyle: { color: "#1e293b" } },
    },

    series: [
      ...pathSeries,
      {
        type: "line",
        data: timestamps.map((t, i) => [t, p10[i]]),
        showSymbol: false,
        lineStyle: { width: 2, color: "#ef4444" },
      },
      {
        type: "line",
        data: timestamps.map((t, i) => [t, p90[i]]),
        showSymbol: false,
        lineStyle: { width: 2, color: "#22c55e" },
      },
      {
        type: "line",
        data: timestamps.map((t, i) => [t, median[i]]),
        showSymbol: false,
        lineStyle: { width: 3, color: "#38bdf8" },
      },
    ],
  };
}
