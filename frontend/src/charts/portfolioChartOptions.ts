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
          ${date.toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric",
          })}
        </div>
      `;
    },
  };
}

export function buildGrid() {
  return {
    left: 40,
    right: 20,
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
    axisLabel: {
      formatter: (v: number) => `${v.toFixed(0)}%`,
      color: "#999",
    },
    splitLine: { lineStyle: { color: "#333" } },
  };
}

export function buildSeries(timestamps: number[], percentValues: number[]) {
  const first = percentValues[0];
  const last = percentValues[percentValues.length - 1];
  const isUp = last >= first;

  const lineColor = isUp ? "#27a95e" : "#e11c14";
  const areaTop = isUp
    ? "rgba(39,169,94,0.40)"
    : "rgba(225,28,20,0.40)";
  const areaBottom = isUp
    ? "rgba(39,169,94,0.05)"
    : "rgba(225,28,20,0.05)";

  return [
    {
      id: "portfolio-line",
      name: "Portfolio % Change",
      type: "line",
      smooth: true,
      showSymbol: false,

      // только первый рендер (опционально)
      animationDuration: 700,
      animationEasing: "easeOutCubic",

      // апдейты выключаем — фейд делаем CSS-ом
      animationDurationUpdate: 0,

      lineStyle: { width: 3, color: lineColor },
      areaStyle: {
        origin: "start",
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
  percentValues: number[]
) {
  return {
    backgroundColor: "transparent",
    animation: true,
    tooltip: buildTooltip(),
    grid: buildGrid(),
    xAxis: buildXAxis(),
    yAxis: buildYAxis(),
    series: buildSeries(timestamps, percentValues),
  };
}
