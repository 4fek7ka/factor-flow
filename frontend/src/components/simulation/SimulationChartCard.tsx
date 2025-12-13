import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import type { EChartsCoreOption, EChartsType } from "echarts/core";

import { LineChart, CustomChart } from "echarts/charts";
import { TooltipComponent, GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  LineChart,
  CustomChart,
  TooltipComponent,
  GridComponent,
  CanvasRenderer,
]);

const TARGET_POINTS = 250;

// нейтральные границы
const BOUND_COLOR = "#64748b";

// белая, заметная заливка диапазона
const RANGE_FILL = "rgba(255, 255, 255, 0.12)";

export type SimulationChartCardProps = {
  timestamps: number[];
  median: number[];
  representative: number[];
  upper: number[];
  lower: number[];
  cloud: number[][];
  showCloud: boolean;
  showMedian: boolean;
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
  showMedian,
}: SimulationChartCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType | null>(null);

  // INIT ONCE
  useEffect(() => {
    if (!ref.current) return;

    const chart = echarts.init(ref.current);
    chartRef.current = chart;

    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  // UPDATE
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const ts = resample(timestamps, TARGET_POINTS);
    const med = resample(median, TARGET_POINTS);
    const rep = resample(representative, TARGET_POINTS);
    const up = resample(upper, TARGET_POINTS);
    const low = resample(lower, TARGET_POINTS);

    const cloudOpacity = showCloud ? 0.08 : 0;
    const medianOpacity = showMedian ? 0.6 : 0; // чуть заметнее

    const option: EChartsCoreOption = {
      backgroundColor: "transparent",

      animationDurationUpdate: 300,
      animationEasingUpdate: "cubicOut",

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
        axisLabel: {
          color: "#94a3b8",
          formatter: (v: number) => `${Math.round(v)}d`,
        },
        axisLine: { lineStyle: { color: "#334155" } },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },

      yAxis: {
        type: "value",
        axisLabel: { color: "#94a3b8" },
        axisLine: { lineStyle: { color: "#334155" } },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },

      series: [
        // ===== CLOUD =====
        ...cloud.map((p) => {
          const r = resample(p, TARGET_POINTS);
          return {
            type: "line",
            data: ts.map((t, i) => [t, r[i]]),
            showSymbol: false,
            silent: true,
            animation: false,
            tooltip: { show: false },
            emphasis: { disabled: true },
            lineStyle: {
              color: "#64748b",
              width: 1,
              opacity: cloudOpacity,
            },
            z: 1,
          };
        }),

        // ===== RANGE =====
        {
          type: "custom",
          silent: true,
          data: [0],
          z: 2,
          tooltip: { show: false },
          emphasis: { disabled: true },
          renderItem: (_params: any, api: any) => {
            const points: number[][] = [];

            for (let i = 0; i < ts.length; i++) {
              points.push(api.coord([ts[i], up[i]]));
            }
            for (let i = ts.length - 1; i >= 0; i--) {
              points.push(api.coord([ts[i], low[i]]));
            }

            return {
              type: "polygon",
              shape: { points },
              style: {
                fill: RANGE_FILL,
                stroke: "none",
              },
            };
          },
        },

        // ===== LOWER =====
        {
          name: "Lower",
          type: "line",
          data: ts.map((t, i) => [t, low[i]]),
          showSymbol: false,
          lineStyle: {
            color: BOUND_COLOR,
            width: 2,
            opacity: 0.75,
          },
          z: 4,
        },

        // ===== UPPER =====
        {
          name: "Upper",
          type: "line",
          data: ts.map((t, i) => [t, up[i]]),
          showSymbol: false,
          lineStyle: {
            color: BOUND_COLOR,
            width: 2,
            opacity: 0.75,
          },
          z: 4,
        },

        // ===== MEDIAN (красная, поверх всех) =====
        {
          name: "Median",
          type: "line",
          data: ts.map((t, i) => [t, med[i]]),
          showSymbol: false,
          tooltip: showMedian ? undefined : { show: false },
          emphasis: showMedian ? undefined : { disabled: true },
          lineStyle: {
            color: "#ef4444",   // 🔴 красный
            width: 2,
            type: "dashed",
            opacity: medianOpacity,
          },
          z: 10,               // ⬆️ поверх всех
        },

        // ===== REPRESENTATIVE =====
        {
          name: "Representative",
          type: "line",
          data: ts.map((t, i) => [t, rep[i]]),
          showSymbol: false,
          lineStyle: {
            color: "#0ea5e9",
            width: 2,
            opacity: 0.9,
          },
          z: 8,
        },
      ],
    };

    chart.setOption(option, { notMerge: true });
  }, [
    timestamps,
    median,
    representative,
    upper,
    lower,
    cloud,
    showCloud,
    showMedian,
  ]);

  return <div ref={ref} style={{ width: "100%", height: 380 }} />;
}
