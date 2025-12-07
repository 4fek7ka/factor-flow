export function buildTooltip() {
  return {
    trigger: "axis",
    formatter: (params: any) => {
      const val = params[0].value as number;
      const sign = val >= 0 ? "+" : "";
      const date = new Date(params[0].axisValue);
      return `
        <div>
          <strong>${sign}${val.toFixed(2)}%</strong><br/>
          ${date.toLocaleDateString("en-GB")}
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

export function buildXAxis(timestamps: Date[]) {
  return {
    type: "category",
    data: timestamps,
    axisLabel: {
      color: "#999",
      formatter: (value: string) => {
        const d = new Date(value);
        if (d.getDate() === 1) {
          return d.toLocaleDateString("en-GB", { month: "short" });
        }
        return "";
      },
    },
    axisTick: { alignWithLabel: true },
    axisLine: { lineStyle: { color: "#555" } },
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

export function buildSeries(percentValues: number[]) {
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
      data: percentValues,
    },
  ];
}

export function buildPortfolioChartOption(
  timestamps: Date[],
  percentValues: number[]
) {
  return {
    backgroundColor: "transparent",
    tooltip: buildTooltip(),
    grid: buildGrid(),
    xAxis: buildXAxis(timestamps),
    yAxis: buildYAxis(),
    series: buildSeries(percentValues),
  };
}
