import type { EChartsCoreOption } from "echarts/core";

const BOUND_COLOR = "#64748b";
const RANGE_FILL = "rgba(255, 255, 255, 0.12)";

type BuildOptionParams = {
  timestamps: number[];
  median: number[];
  representative: number[];
  upper: number[];
  lower: number[];
  cloud: number[][];
  yDomain: { min: number; max: number };
  flags: {
    showCloud: boolean;
    showMedian: boolean;
    showRepresentative: boolean;
    showRange: boolean;
  };
};

export function buildSimulationChartOption({
  timestamps,
  median,
  representative,
  upper,
  lower,
  cloud,
  yDomain,
  flags,
}: BuildOptionParams): EChartsCoreOption {
  const cloudOpacity = flags.showCloud ? 0.15 : 0;
  const medianOpacity = flags.showMedian ? 0.45 : 0;
  const repOpacity = flags.showRepresentative ? 0.7 : 0;
  const rangeOpacity = flags.showRange ? 1 : 0;

  return {
    backgroundColor: "transparent",

    animationDurationUpdate: 300,
    animationEasingUpdate: "cubicOut",

    tooltip: {
      trigger: "axis",
      valueFormatter: (v: number) => `${v.toFixed(2)}%`,
    },

    grid: {
      left: 40,
      right: 24,
      top: 44,
      bottom: 40,
    },

    xAxis: {
      type: "value",
      min: 0,
      max: timestamps[timestamps.length - 1],
      animation: false,
      axisLabel: {
        color: "#94a3b8",
        formatter: (v: number) => `${Math.round(v)}d`,
      },
      axisLine: { lineStyle: { color: "#334155" } },
      splitLine: { show: false },
    },

    yAxis: {
      type: "value",
      min: yDomain.min,
      max: yDomain.max,
      animation: false,

      axisLabel: {
        color: "#94a3b8",
        formatter: (v: number) => {
          if (v === yDomain.min || v === yDomain.max) return "";
          return `${v}%`;
        },
      },

      axisLine: { lineStyle: { color: "#334155" } },

      splitLine: {
        show: true,

        // ✅ убираем только крайние (верх/низ)
        // (в новых версиях ECharts это поддерживается)
        showMinLine: false,
        showMaxLine: false,

        lineStyle: {
          color: "#334155",
          width: 1,
          opacity: 0.7,
        },
      },
    },

    series: [
      ...cloud.map((p) => ({
        type: "line",
        data: timestamps.map((t, i) => [t, p[i]]),
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
      })),

      {
        type: "custom",
        silent: true,
        animation: false,
        data: [0],
        z: 2,
        renderItem: (_p: unknown, api: any) => {
          if (!flags.showRange) return null;

          const points: number[][] = [];

          for (let i = 0; i < timestamps.length; i++) {
            points.push(api.coord([timestamps[i], upper[i]]));
          }
          for (let i = timestamps.length - 1; i >= 0; i--) {
            points.push(api.coord([timestamps[i], lower[i]]));
          }

          return {
            type: "polygon",
            shape: { points },
            style: {
              fill: RANGE_FILL,
              opacity: rangeOpacity,
            },
          };
        },
      },

      {
        type: "line",
        data: timestamps.map((t, i) => [t, lower[i]]),
        showSymbol: false,
        animation: false,
        silent: true,
        lineStyle: {
          color: BOUND_COLOR,
          width: 1.5,
          opacity: flags.showRange ? 0.5 : 0,
        },
        z: 4,
      },

      {
        type: "line",
        data: timestamps.map((t, i) => [t, upper[i]]),
        showSymbol: false,
        animation: false,
        silent: true,
        lineStyle: {
          color: BOUND_COLOR,
          width: 1.5,
          opacity: flags.showRange ? 0.5 : 0,
        },
        z: 4,
      },

      {
        type: "line",
        data: timestamps.map((t, i) => [t, median[i]]),
        showSymbol: false,
        tooltip: flags.showMedian ? undefined : { show: false },
        emphasis: flags.showMedian ? undefined : { disabled: true },
        lineStyle: {
          color: "#ef4444",
          width: 2,
          type: "dashed",
          opacity: medianOpacity,
        },
        z: 10,
      },

      {
        type: "line",
        data: timestamps.map((t, i) => [t, representative[i]]),
        showSymbol: false,
        tooltip: flags.showRepresentative ? undefined : { show: false },
        emphasis: flags.showRepresentative ? undefined : { disabled: true },
        lineStyle: {
          color: "#0ea5e9",
          width: 2,
          opacity: repOpacity,
        },
        z: 8,
      },
    ],
  };
}
