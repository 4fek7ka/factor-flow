// simulationChart.option.ts
import type { EChartsCoreOption } from "echarts/core";

/* =========================
   ACCENT CLOUD COLORS
========================= */

// мягкое облако
const CLOUD_COLOR = "rgba(187,134,252,0.14)"; // var(--primary) с alpha

// fan — чуть плотнее, но всё ещё мягко
const FAN_OUTER = "rgba(187,134,252,0.18)";
const FAN_INNER = "rgba(187,134,252,0.28)";

const COLOR_MAIN = "#0ea5e9";

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
  cloud: number[][];
  fan?: FanQuantiles;
  yDomain: { min: number; max: number };
  flags: {
    showCloud: boolean;
    showMedian: boolean;
    showRepresentative: boolean;
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
  cloud,
  fan,
  yDomain,
  flags,
}: BuildOptionParams): EChartsCoreOption {
  const series: any[] = [
    /* ================= CLOUD ================= */
    ...cloud.map((p) => ({
      type: "line",
      name: "Cloud",
      data: timestamps.map((t, i) => [t, p[i]]),
      showSymbol: false,
      silent: true,
      tooltip: { show: false },
      lineStyle: {
        color: CLOUD_COLOR,
        width: 1,
        opacity: flags.showCloud ? 1 : 0,
      },
      z: 1,
    })),

    /* ================= FAN ================= */
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
        style: {
          fill: FAN_OUTER,
          opacity: flags.showFan ? 1 : 0,
          // важно: никакой обводки
          stroke: "rgba(0,0,0,0)",
          lineWidth: 0,
        },
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
        style: {
          fill: FAN_INNER,
          opacity: flags.showFan ? 1 : 0,
          // важно: никакой обводки
          stroke: "rgba(0,0,0,0)",
          lineWidth: 0,
        },
      }),
    },

    /* ================= MEDIAN ================= */
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

    /* ================= MAIN ================= */
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
  ].filter(Boolean);

  return {
    backgroundColor: "transparent",

    tooltip: {
      trigger: "axis",
      appendToBody: true,
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
          <div style="font-weight:700;margin-bottom:6px">
            Simulation
          </div>
        `;

        if (flags.showRepresentative) {
          html += tooltipRow("Main", representative[i], COLOR_MAIN);
        }
        if (flags.showMedian) {
          html += tooltipRow("Median", median[i], "rgba(226,232,240,0.7)");
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

      // ✅ УБИРАЕМ ДВЕ ЛИНИИ: сверху и снизу (на max/min)
      splitLine: {
        show: true,
        showMinLine: false,
        showMaxLine: false,
        lineStyle: { color: "rgba(148,163,184,0.18)" },
      },
    },

    series,
  };
}
