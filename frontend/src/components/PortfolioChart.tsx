import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import history from "../data/mock-history.json";

const AMOUNTS = {
  ETH: 2,
  WBTC: 0.03,
  USDC: 80,
  DAI: 40,
  UNI: 400,
};

export function PortfolioChart() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, "dark");

    // 1. Время (timestamps)
    const timestamps = history.map((p) => new Date(p.timestamp * 1000));

    // 2. Стоимость портфеля по каждой точке
    const values = history.map((p) => {
      const pr = p.prices;
      return (
        pr.ETH * AMOUNTS.ETH +
        pr.WBTC * AMOUNTS.WBTC +
        pr.USDC * AMOUNTS.USDC +
        pr.DAI * AMOUNTS.DAI +
        pr.UNI * AMOUNTS.UNI
      );
    });

    if (!values.length) return;

    // 3. Переводим в % изменения относительно первой точки
    const base = values[0];
    const percentValues = values.map((v) => ((v - base) / base) * 100);

    // 4. Настройки графика
    const option = {
      backgroundColor: "transparent",

      tooltip: {
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
      },

      grid: {
        left: 40,
        right: 20,
        top: 20,
        bottom: 40,
      },

      // ===== Чистая месячная ось =====
      xAxis: {
        type: "category",
        data: timestamps,
        axisLabel: {
          color: "#999",
          formatter: (value: string) => {
            const d = new Date(value);

            // Показываем только месяц, только для 1-го числа
            if (d.getDate() === 1) {
              return d.toLocaleDateString("en-GB", {
                month: "short",
              });
            }
            return "";
          },
        },
        axisTick: { alignWithLabel: true },
        axisLine: { lineStyle: { color: "#555" } },
      },

      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (v: number) => `${v.toFixed(0)}%`,
          color: "#999",
        },
        splitLine: { lineStyle: { color: "#333" } },
      },

      series: [
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
      ],
    };

    chart.setOption(option);

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(chartRef.current);

    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height: "350px" }} />;
}
