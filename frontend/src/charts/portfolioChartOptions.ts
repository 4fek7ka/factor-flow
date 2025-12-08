type ChartParams = {
  seriesId?: string;
  initial?: boolean;
  opacity?: number; // 0..1
};

export function buildTooltip() {
  return {
    trigger: "axis",
    formatter: (params: any) => {
      const val = params[0].value[1] as number;
      const sign = val >= 0 ? "+" : "";
      const date = new Date(params[0].value[0]);

      return `
        <div>
          <strong>${sign}${val.toFixed(2)}%</strong><br/>
          ${date.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </div>
      `;
    },
  };
}

export function buildGrid() {
  return {
    left: 20,
    right: 48, // ✅ место под проценты справа
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
    position: "right", // ✅ проценты справа
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

export function buildSeries(
  timestamps: number[],
  percentValues: number[],
  params: ChartParams = {}
) {
  const { seriesId = "portfolio-line", initial = false, opacity = 1 } = params;

  const first = percentValues[0];
  const last = percentValues[percentValues.length - 1];
  const isUp = last >= first;

  const lineColor = isUp ? "#27a95e" : "#e11c14";
  const areaTop = isUp ? "rgba(39,169,94,0.40)" : "rgba(225,28,20,0.40)";
  const areaBottom = isUp ? "rgba(39,169,94,0.05)" : "rgba(225,28,20,0.05)";

  return [
    {
      id: seriesId,
      name: "Portfolio % Change",
      type: "line",
      smooth: false,
      showSymbol: false,


      animationDuration: initial ? 1500 : 0,
      animationEasing: initial ? "quadraticInOut" : "linear",

      animationDurationUpdate: 750,
      animationEasingUpdate: "quadraticInOut",

      lineStyle: {
        width: 3,
        color: lineColor,
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
            { offset: 0, color: areaTop },
            { offset: 1, color: areaBottom },
          ],
        },
      },

      data: percentValues.map((v, i) => [timestamps[i], v]),
    },
  ];
}

export function buildPortfolioChartOption(
  timestamps: number[],
  percentValues: number[],
  params: ChartParams = {}
) {
  return {
    backgroundColor: "transparent",
    animation: true,
    tooltip: buildTooltip(),
    grid: buildGrid(),
    xAxis: buildXAxis(),
    yAxis: buildYAxis(),
    series: buildSeries(timestamps, percentValues, params),
  };
}
