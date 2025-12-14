// simulationChart.option.ts
import type { EChartsCoreOption } from "echarts/core";

const BOUND_COLOR = "#64748b";
const RANGE_FILL = "rgba(255, 255, 255, 0.12)";

const FAN_OUTER = "rgba(148,163,184,0.12)";
const FAN_INNER = "rgba(148,163,184,0.20)";

const COLOR_MAIN = "#0ea5e9";
const COLOR_UPPER = "#22c55e";
const COLOR_LOWER = "#ef4444";

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
  dotColor: string,
  bold = false
) {
  return `
    <div style="
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      margin-top:4px;
      font-weight:${bold ? 800 : 700};
    ">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="
          width:8px;
          height:8px;
          border-radius:50%;
          background:${dotColor};
        "></span>
        <span style="color:rgba(148,163,184,0.9)">${label}</span>
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
  return {
    backgroundColor: "transparent",

    // ✅ ключевая часть
    animationDurationUpdate: 420,
    animationEasingUpdate: "cubicOut",

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

        const i = main.dataIndex;
        const day = Math.round(main.value[0]);

        let html = `<div style="font-weight:800;margin-bottom:6px">${day}d</div>`;
        html += tooltipRow("Upper", upper[i], COLOR_UPPER);
        html += tooltipRow("Main", representative[i], COLOR_MAIN, true);
        html += tooltipRow("Lower", lower[i], COLOR_LOWER);
        return html;
      },
    },

    grid: { left: 40, right: 48, top: 44, bottom: 40 },

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
          opacity: flags.showCloud ? 0.15 : 0,
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
          shape: { points: buildPolygon(timestamps, fan.q95, fan.q05, api) },
          style: { fill: FAN_OUTER, opacity: flags.showFan ? 1 : 0 },
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
          shape: { points: buildPolygon(timestamps, fan.q75, fan.q25, api) },
          style: { fill: FAN_INNER, opacity: flags.showFan ? 1 : 0 },
        }),
      },

      {
        type: "line",
        name: "Median",
        data: timestamps.map((t, i) => [t, median[i]]),
        showSymbol: false,
        animation: true,
        lineStyle: {
          color: "#ef4444",
          width: 2,
          opacity: flags.showMedian ? 0.45 : 0,
        },
        z: 10,
      },

      {
        type: "line",
        name: "Main",
        data: timestamps.map((t, i) => [t, representative[i]]),
        showSymbol: false,
        animation: true,
        lineStyle: {
          color: COLOR_MAIN,
          width: 2,
          opacity: flags.showRepresentative ? 0.7 : 0,
        },
        z: 12,
      },
    ].filter(Boolean),
  };
}
