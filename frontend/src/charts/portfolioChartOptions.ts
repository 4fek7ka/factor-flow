/* =========================
   Types
========================= */

type ChartParams = {
  seriesId?: string;
  initial?: boolean;
  opacity?: number; // 0..1
};

type LineSeries = {
  id: string;
  name: string;
  type: "line";
  smooth: boolean;
  showSymbol: boolean;

  animationDuration: number;
  animationEasing: string;
  animationDurationUpdate: number;
  animationEasingUpdate: string;

  color?: string;        // ⬅️ ВАЖНО
  lineStyle: any;
  areaStyle?: any;
  emphasis?: any;

  data: Array<[number, number]>;
};

/* =========================
   Tooltip
========================= */

export function buildTooltip() {
  return {
    trigger: "axis",
    formatter: (params: any[]) => {
      const date = new Date(params[0].value[0]);

      const rows = params.map((p) => {
        const val = p.value[1] as number;
        const sign = val >= 0 ? "+" : "";
        return `<div><strong>${p.seriesName}:</strong> ${sign}${val.toFixed(
          2
        )}%</div>`;
      });

      return `
        <div>
          ${rows.join("")}
          <div style="margin-top:6px;opacity:0.7">
            ${date.toLocaleDateString("en-GB", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      `;
    },
  };
}

/* =========================
   Layout
========================= */

export function buildGrid() {
  return {
    left: 20,
    right: 48,
    top: 20,
    bottom: 40,
  };
}

export function buildXAxis() {
  return {
    type: "time",
    axisLabel: {
      color: "#999",
      formatter: (value: number) => {
        const d = new Date(value);
        return d.toLocaleDateString("en-GB", { month: "short" });
      },
    },
    axisLine: { lineStyle: { color: "#555" } },
    splitLine: { show: false },
  };
}

export function buildYAxis() {
  return {
    type: "value",
    position: "right",
    axisLabel: {
      formatter: (v: number) => `${v.toFixed(0)}%`,
      color: "#999",
      margin: 12,
    },
    axisLine: { lineStyle: { color: "#555" } },
    axisTick: { show: true },
    splitLine: { lineStyle: { color: "#333" } },
  };
}

/* =========================
   Series builders
========================= */

function buildPortfolioSeries(
  timestamps: number[],
  percentValues: number[],
  params: ChartParams
): LineSeries {
  const { seriesId = "portfolio", initial = false, opacity = 1 } = params;

  const ACCENT = "#8B5CF6";
  const AREA_TOP = "rgba(139,92,246,0.35)";
  const AREA_BOTTOM = "rgba(139,92,246,0.00)";

  return {
    id: seriesId,
    name: "Portfolio",
    type: "line",
    smooth: false,
    showSymbol: false,

    animationDuration: initial ? 1500 : 0,
    animationEasing: initial ? "quadraticInOut" : "linear",
    animationDurationUpdate: 750,
    animationEasingUpdate: "quadraticInOut",

    color: ACCENT,
    lineStyle: {
      width: 3,
      color: ACCENT,
      opacity,
    },

    areaStyle: {
      origin: "start",
      opacity,
      color: {
        type: "linear",
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: AREA_TOP },
          { offset: 1, color: AREA_BOTTOM },
        ],
      },
    },

    data: percentValues.map((v, i) => [timestamps[i], v]),
  };
}

function buildBtcSeries(
  timestamps: number[],
  btcPercentValues: number[],
  initial = false
): LineSeries {
  const BTC_ORANGE = "#F59E0B"; // 🔥 явно тёплый benchmark

  return {
    id: "btc",
    name: "BTC",
    type: "line",
    smooth: false,
    showSymbol: false,

    animationDuration: initial ? 1500 : 0,
    animationEasing: initial ? "quadraticInOut" : "linear",
    animationDurationUpdate: 750,
    animationEasingUpdate: "quadraticInOut",

    color: BTC_ORANGE, // ⬅️ КЛЮЧЕВО
    lineStyle: {
      width: 2,
      color: BTC_ORANGE,
      type: "dashed",
    },

    emphasis: {
      focus: "series",
    },

    data: btcPercentValues.map((v, i) => [timestamps[i], v]),
  };
}

/* =========================
   Option
========================= */

export function buildPortfolioChartOption(
  timestamps: number[],
  percentValues: number[],
  params: ChartParams = {},
  btcPercentValues?: number[]
) {
  const series: LineSeries[] = [
    buildPortfolioSeries(timestamps, percentValues, params),
  ];

  if (btcPercentValues && btcPercentValues.length) {
    series.push(buildBtcSeries(timestamps, btcPercentValues, params.initial));
  }

  return {
    backgroundColor: "transparent",
    animation: true,
    tooltip: buildTooltip(),
    grid: buildGrid(),
    xAxis: buildXAxis(),
    yAxis: buildYAxis(),
    series,
  };
}
