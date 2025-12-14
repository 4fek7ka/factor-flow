// simulationChart.option.ts
import type { EChartsCoreOption } from "echarts/core";

const BOUND_COLOR = "#64748b";
const RANGE_FILL = "rgba(255, 255, 255, 0.12)";

// Fan (quantile bands) — мягкий, читабельный
const FAN_OUTER_FILL = "rgba(14, 165, 233, 0.10)"; // q05-q95
const FAN_INNER_FILL = "rgba(14, 165, 233, 0.18)"; // q25-q75

type FanQuantiles = {
  q05: number[];
  q25: number[];
  q50: number[];
  q75: number[];
  q95: number[];
};

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

    // NEW: Quantile Fan
    showFan?: boolean;
  };

  // NEW: Quantile Fan data
  fan?: FanQuantiles;
};

function buildBandPolygon(
  timestamps: number[],
  upperArr: number[],
  lowerArr: number[],
  api: any
): number[][] | null {
  const n = timestamps.length;
  if (n === 0) return null;
  if (upperArr.length !== n || lowerArr.length !== n) return null;

  const points: number[][] = [];

  for (let i = 0; i < n; i++) {
    const x = timestamps[i];
    const y = upperArr[i];
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    points.push(api.coord([x, y]));
  }

  for (let i = n - 1; i >= 0; i--) {
    const x = timestamps[i];
    const y = lowerArr[i];
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    points.push(api.coord([x, y]));
  }

  return points;
}

function bandSeries(opts: {
  enabled: boolean;
  timestamps: number[];
  upper: number[];
  lower: number[];
  fill: string;
  z: number;
}) {
  const { enabled, timestamps, upper, lower, fill, z } = opts;

  return {
    type: "custom" as const,
    silent: true,
    animation: false,
    data: [0],
    z,
    renderItem: (_p: unknown, api: any) => {
      if (!enabled) return null;

      const points = buildBandPolygon(timestamps, upper, lower, api);
      if (!points) return null;

      return {
        type: "polygon",
        shape: { points },
        style: {
          fill,
        },
      };
    },
  };
}

export function buildSimulationChartOption({
  timestamps,
  median,
  representative,
  upper,
  lower,
  cloud,
  yDomain,
  flags,
  fan,
}: BuildOptionParams): EChartsCoreOption {
  const cloudOpacity = flags.showCloud ? 0.15 : 0;
  const medianOpacity = flags.showMedian ? 0.45 : 0;
  const repOpacity = flags.showRepresentative ? 0.7 : 0;
  const rangeOpacity = flags.showRange ? 1 : 0;

  const showFan = Boolean(flags.showFan && fan);

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
      right: 48,
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
      axisLine: {
        lineStyle: { color: "#334155" },
      },
      splitLine: {
        show: false,
      },
    },

    yAxis: {
      type: "value",
      min: yDomain.min,
      max: yDomain.max,
      position: "right",
      animation: false,

      axisLabel: {
        color: "#94a3b8",
        align: "left",
        margin: 8,
        formatter: (v: number) => {
          if (v === yDomain.min || v === yDomain.max) return "";
          return `${v}%`;
        },
      },

      axisLine: { show: false },
      axisTick: { show: false },

      splitLine: {
        show: true,
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
      // cloud
      ...cloud.map((p) => ({
        type: "line" as const,
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

      // NEW: Fan bands (quantiles)
      ...(showFan
        ? [
            bandSeries({
              enabled: true,
              timestamps,
              upper: fan!.q95,
              lower: fan!.q05,
              fill: FAN_OUTER_FILL,
              z: 2,
            }),
            bandSeries({
              enabled: true,
              timestamps,
              upper: fan!.q75,
              lower: fan!.q25,
              fill: FAN_INNER_FILL,
              z: 3,
            }),
          ]
        : []),

      // range fill (Simple/Advanced)
      {
        type: "custom",
        silent: true,
        animation: false,
        data: [0],
        z: 4,
        renderItem: (_p: unknown, api: any) => {
          if (!flags.showRange) return null;

          const points = buildBandPolygon(timestamps, upper, lower, api);
          if (!points) return null;

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

      // lower bound
      {
        type: "line",
        data: timestamps.map((t, i) => [t, lower[i]]),
        showSymbol: false,
        silent: true,
        animation: false,
        lineStyle: {
          color: BOUND_COLOR,
          width: 1.5,
          opacity: flags.showRange ? 1 : 0,
        },
        z: 6,
      },

      // upper bound
      {
        type: "line",
        data: timestamps.map((t, i) => [t, upper[i]]),
        showSymbol: false,
        silent: true,
        animation: false,
        lineStyle: {
          color: BOUND_COLOR,
          width: 1.5,
          opacity: flags.showRange ? 1 : 0,
        },
        z: 6,
      },

      // median
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

      // representative
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
        z: 12,
      },
    ],
  };
}
