// simulationChart.option.ts
import type { EChartsCoreOption } from "echarts/core";

const BOUND_COLOR = "#64748b";
const RANGE_FILL = "rgba(255, 255, 255, 0.12)";

const FAN_OUTER = "rgba(148,163,184,0.12)";
const FAN_INNER = "rgba(148,163,184,0.20)";

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
  fan?: FanQuantiles;
  yDomain: { min: number; max: number };
  flags: {
    showCloud: boolean;
    showMedian: boolean;
    showRepresentative: boolean;
    showRange: boolean;
    showFan: boolean;
  };
};

function buildPolygon(
  timestamps: number[],
  upper: number[],
  lower: number[],
  api: any
) {
  const pts: number[][] = [];
  for (let i = 0; i < timestamps.length; i++) {
    pts.push(api.coord([timestamps[i], upper[i]]));
  }
  for (let i = timestamps.length - 1; i >= 0; i--) {
    pts.push(api.coord([timestamps[i], lower[i]]));
  }
  return pts;
}

function tooltipRow(
  label: string,
  value: number,
  color: string,
  bold = false
) {
  return `
    <div style="
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
      margin-top:4px;
      font-weight:${bold ? 800 : 700};
    ">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="
          width:8px;
          height:8px;
          border-radius:50%;
          background:${color};
          display:inline-block;
        "></span>
        <span style="color:rgba(148,163,184,0.9)">
          ${label}
        </span>
      </div>

      <span style="color:rgba(30,41,59,0.95)">
        ${value.toFixed(2)}%
      </span>
    </div>
  `;
}

export function buildSimulationChartOption({
  timestamps,
  median,
  representative,
  upper,
  lower,
  cloud,
  fan,
  yDomain,
  flags,
}: BuildOptionParams): EChartsCoreOption {
  const cloudOpacity = flags.showCloud ? 0.15 : 0;
  const rangeOpacity = flags.showRange ? 1 : 0;
  const medianOpacity = flags.showMedian ? 0.45 : 0;
  const repOpacity = flags.showRepresentative ? 0.7 : 0;
  const fanOpacity = flags.showFan ? 1 : 0;

  return {
    backgroundColor: "transparent",
    animation: false,

    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
        lineStyle: {
          color: "rgba(148,163,184,0.45)",
          width: 1,
          type: "dashed",
        },
      },
      formatter: (params: any[]) => {
        const main = params.find((p) => p.seriesName === "Main");
        if (!main) return "";

        const idx = main.dataIndex;
        const day = Math.round(main.value[0]);

        let html = `
          <div style="font-weight:800;margin-bottom:6px">
            ${day}d
          </div>
        `;

        // TOP: upper
        html += tooltipRow("Upper", upper[idx], BOUND_COLOR);

        // CENTER: main
        html += tooltipRow("Main", representative[idx], "#0ea5e9", true);

        // BOTTOM: lower
        html += tooltipRow("Lower", lower[idx], BOUND_COLOR);

        return html;
      },
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
      axisLine: { lineStyle: { color: "#334155" } },
      splitLine: { show: false },
    },

    yAxis: {
      type: "value",
      min: yDomain.min,
      max: yDomain.max,
      position: "right",
      animation: false,
      axisLabel: {
        color: "#94a3b8",
        formatter: (v: number) =>
          v === yDomain.min || v === yDomain.max ? "" : `${v}%`,
      },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        showMinLine: false,
        showMaxLine: false,
        lineStyle: { color: "#334155", width: 1, opacity: 0.7 },
      },
    },

    series: [
      ...cloud.map((p) => ({
        type: "line",
        name: "Cloud",
        data: timestamps.map((t, i) => [t, p[i]]),
        showSymbol: false,
        silent: true,
        tooltip: { show: false },
        animation: false,
        lineStyle: {
          color: "#64748b",
          width: 1,
          opacity: cloudOpacity,
        },
        z: 1,
      })),

      fan && {
        type: "custom",
        name: "FanOuter",
        silent: true,
        tooltip: { show: false },
        animation: false,
        data: [0],
        z: 2,
        renderItem: (_: unknown, api: any) => ({
          type: "polygon",
          shape: {
            points: buildPolygon(timestamps, fan.q95, fan.q05, api),
          },
          style: { fill: FAN_OUTER, opacity: fanOpacity },
        }),
      },

      fan && {
        type: "custom",
        name: "FanInner",
        silent: true,
        tooltip: { show: false },
        animation: false,
        data: [0],
        z: 3,
        renderItem: (_: unknown, api: any) => ({
          type: "polygon",
          shape: {
            points: buildPolygon(timestamps, fan.q75, fan.q25, api),
          },
          style: { fill: FAN_INNER, opacity: fanOpacity },
        }),
      },

      {
        type: "custom",
        name: "Range",
        silent: true,
        tooltip: { show: false },
        animation: false,
        data: [0],
        z: 4,
        renderItem: (_: unknown, api: any) => ({
          type: "polygon",
          shape: {
            points: buildPolygon(timestamps, upper, lower, api),
          },
          style: { fill: RANGE_FILL, opacity: rangeOpacity },
        }),
      },

      {
        type: "line",
        name: "Median",
        data: timestamps.map((t, i) => [t, median[i]]),
        showSymbol: false,
        tooltip: { show: false },
        animation: false,
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
        name: "Main",
        data: timestamps.map((t, i) => [t, representative[i]]),
        showSymbol: false,
        animation: false,
        lineStyle: {
          color: "#0ea5e9",
          width: 2,
          opacity: repOpacity,
        },
        z: 12,
      },
    ].filter(Boolean),
  };
}
