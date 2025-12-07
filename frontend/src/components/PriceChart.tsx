import  { useEffect, useRef } from "react";
import * as echarts from "echarts";

export function PriceChart() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, "dark");

    const option = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis"
      },
      grid: {
        left: 40,
        right: 20,
        top: 30,
        bottom: 30
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        axisLine: { lineStyle: { color: "#888" } }
      },
      yAxis: {
        type: "value",
        axisLine: { lineStyle: { color: "#888" } },
        splitLine: { lineStyle: { color: "#333" } }
      },
      series: [
        {
          name: "Mock price",
          type: "line",
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 3,
            color: "#1f8ef1"
          },
          areaStyle: {
            color: "rgba(31,142,241,0.25)"
          },
          data: [120, 132, 101, 134, 90, 230, 210]
        }
      ]
    };

    chart.setOption(option);

    // Автоматическое обновление размеров
    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, []);

  return (
    <div ref={chartRef} style={{ width: "100%", height: "350px" }} />
  );
}
