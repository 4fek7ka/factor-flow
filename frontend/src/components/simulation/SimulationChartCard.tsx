import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { TooltipComponent, GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([LineChart, TooltipComponent, GridComponent, CanvasRenderer]);

const TARGET_POINTS = 250;

export type SimulationChartCardProps = {
  timestamps: number[];
  median: number[];
  representative: number[];
  upper: number[];
  lower: number[];
  cloud: number[][];
  showCloud: boolean;
};

function resample<T>(arr: T[], target: number): T[] {
  if (arr.length <= target) return arr;

  const res: T[] = [];
  const step = (arr.length - 1) / (target - 1);

  for (let i = 0; i < target; i++) {
    res.push(arr[Math.round(i * step)]);
  }
  return res;
}

export function SimulationChartCard({
  timestamps,
  median,
  representative,
  upper,
  lower,
  cloud,
  showCloud,
}: SimulationChartCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const chart = echarts.init(ref.current);

    const ts = resample(timestamps, TARGET_POINTS);
    const med = resample(median, TARGET_POINTS);
    const rep = resample(representative, TARGET_POINTS);
    const up = resample(upper, TARGET_POINTS);
    const low = resample(lower, TARGET_POINTS);

    const cloudSeries = showCloud
      ? cloud.map((p) => {
          const r = resample(p, TARGET_POINTS);
          return {
            type: "line" as const,
            data: ts.map((t, i) => [t, r[i]]),
            showSymbol: false,
            lineStyle: {
              width: 1,
              opacity: 0.1,
              color: "#64748b",
            },
            silent: true,
            animation: false,
            z: 1,
          };
        })
      : [];

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
        type: "value",
        min: 0,
        max: ts[ts.length - 1],
        boundaryGap: false,
        axisLabel: {
          color: "#94a3b8",
          formatter: (v: number) => `${Math.round(v)}d`,
        },
        axisLine: {
          lineStyle: { color: "#334155" },
        },
        splitLine: {
          lineStyle: { color: "#1e293b" }, // мягкая сетка как в Portfolio
        },
      },

      yAxis: {
        type: "value",
        axisLabel: {
          color: "#94a3b8",
        },
        axisLine: {
          lineStyle: { color: "#334155" },
        },
        splitLine: {
          lineStyle: { color: "#1e293b" }, // мягкая сетка
        },
      },

      series: [
        ...cloudSeries,

        // Upper bound
        {
          name: "Upper",
          type: "line",
          data: ts.map((t, i) => [t, up[i]]),
          showSymbol: false,
          lineStyle: {
            width: 2,
            color: "#22c55e",
          },
          z: 5,
        },

        // Lower bound
        {
          name: "Lower",
          type: "line",
          data: ts.map((t, i) => [t, low[i]]),
          showSymbol: false,
          lineStyle: {
            width: 2,
            color: "#ef4444",
          },
          z: 5,
        },

        // Median (statistical) — dashed
        {
          name: "Median",
          type: "line",
          data: ts.map((t, i) => [t, med[i]]),
          showSymbol: false,
          lineStyle: {
            width: 2,
            type: "dashed",
            color: "#0ea5e9",
            opacity: 0.6,
          },
          z: 8,
        },

        // Representative path — main focus
        {
          name: "Representative",
          type: "line",
          data: ts.map((t, i) => [t, rep[i]]),
          showSymbol: false,
          lineStyle: {
            width: 3,
            color: "#0ea5e9",
          },
          z: 10,
        },
      ],
    };

    chart.setOption(option);

    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      chart.dispose();
    };
  }, [timestamps, median, representative, upper, lower, cloud, showCloud]);

  return <div ref={ref} style={{ width: "100%", height: 380 }} />;
}
