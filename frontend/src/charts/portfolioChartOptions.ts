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
        return d.toLocaleDateString("en-GB", {
          month: "short",
        });
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
  return [
    {
      name: "Portfolio % Change",
      type: "line",
      smooth: true,
      showSymbol: false,

      lineStyle: {
        width: 3,
        color: "#4a90e2",
      },

      areaStyle: {
        origin: "start",
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(74,144,226,0.40)" },
            { offset: 1, color: "rgba(74,144,226,0.05)" },
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
    tooltip: buildTooltip(),
    grid: buildGrid(),
    xAxis: buildXAxis(),
    yAxis: buildYAxis(),
    series: buildSeries(timestamps, percentValues),
  };
}
