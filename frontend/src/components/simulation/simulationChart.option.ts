// simulationChart.option.ts
import type { EChartsCoreOption } from "echarts/core";

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

function tooltipRow(label: string, value: number, color: string) {
  const sign = value >= 0 ? "+" : "";
  return `
    <div style="
      display:flex;
      justify-content:space-between;
      gap:12px;
      margin-top:4px;
      font-weight:600;
    ">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="
          width:8px;
          height:8px;
          border-radius:50%;
          background:${color};
        "></span>
        <span style="color:rgba(226,232,240,0.85)">${label}</span>
      </div>
      <span style="color:rgba(226,232,240,0.95)">
        ${sign}${value.toFixed(2)}%
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

    tooltip: {
      trigger: "axis",
      appendToBody: true,

      /* ✅ Tabler card colors */
      backgroundColor: "var(--tblr-card-bg)",
      borderColor: "var(--tblr-border-color)",
      borderWidth: 1,

      textStyle: {
        color: "rgba(226,232,240,0.95)",
        fontSize: 12,
      },

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

        let html = `
          <div style="
            font-weight:700;
            margin-bottom:6px;
            color:rgba(226,232,240,0.95)
          ">
            Simulation
          </div>
        `;

        if (flags.showRange) {
          html += tooltipRow("Upper", upper[i], COLOR_UPPER);
        }

        if (flags.showRepresentative) {
          html += tooltipRow("Main", representative[i], COLOR_MAIN);
        }

        if (flags.showMedian) {
          html += tooltipRow("Median", median[i], "rgba(226,232,240,0.7)");
        }

        if (flags.showRange) {
          html += tooltipRow("Lower", lower[i], COLOR_LOWER);
        }

        return html;
      },
    },

    grid: { left: 40, right: 48, top: 44, bottom: 40 },

    xAxis: {
      type: "value",
      min: 0,
      max: timestamps[timestamps.length - 1],
      axisLabel: {
        color: "rgba(148,163,184,0.85)",
        formatter: (v: number) => `${Math.round(v)}d`,
      },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
      splitLine: { show: false },
    },

    yAxis: {
      type: "value",
      min: yDomain.min,
      max: yDomain.max,
      position: "right",
      axisLabel: {
        color: "rgba(148,163,184,0.85)",
        formatter: (v: number) =>
          v === yDomain.min || v === yDomain.max ? "" : `${v}%`,
      },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: { color: "rgba(148,163,184,0.18)" },
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
        data: [0],
        z: 2,
        renderItem: (_: unknown, api: any) => ({
          type: "polygon",
          shape: {
            points: [
              ...timestamps.map((t, i) => api.coord([t, fan.q95[i]])),
              ...timestamps
                .slice()
                .reverse()
                .map((t, i) =>
                  api.coord([t, fan.q05[fan.q05.length - 1 - i]])
                ),
            ],
          },
          style: { fill: FAN_OUTER, opacity: flags.showFan ? 1 : 0 },
        }),
      },

      fan && {
        type: "custom",
        name: "FanInner",
        silent: true,
        tooltip: { show: false },
        data: [0],
        z: 3,
        renderItem: (_: unknown, api: any) => ({
          type: "polygon",
          shape: {
            points: [
              ...timestamps.map((t, i) => api.coord([t, fan.q75[i]])),
              ...timestamps
                .slice()
                .reverse()
                .map((t, i) =>
                  api.coord([t, fan.q25[fan.q25.length - 1 - i]])
                ),
            ],
          },
          style: { fill: FAN_INNER, opacity: flags.showFan ? 1 : 0 },
        }),
      },

      {
        type: "line",
        name: "Median",
        data: timestamps.map((t, i) => [t, median[i]]),
        showSymbol: false,
        lineStyle: {
          color: "rgba(226,232,240,0.7)",
          width: 2,
          opacity: flags.showMedian ? 1 : 0,
          type: "dashed",
        },
        z: 10,
      },

      {
        type: "line",
        name: "Main",
        data: timestamps.map((t, i) => [t, representative[i]]),
        showSymbol: false,
        lineStyle: {
          color: COLOR_MAIN,
          width: 2,
          opacity: flags.showRepresentative ? 1 : 0,
        },
        z: 12,
      },
    ].filter(Boolean),
  };
}
