import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import history from "../data/mock-history.json";

import {
  buildPortfolioSeries,
  filterHistoryByPeriod,
} from "../services/portfolioService";
import type { Period } from "../services/portfolioService";

import { buildPortfolioChartOption } from "../charts/portfolioChartOptions";

const FADE_MS = 180;

export function PortfolioChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const fadeTimerRef = useRef<number | null>(null);

  const [period, setPeriod] = useState<Period>("year");
  const [isFading, setIsFading] = useState(false);

  // init chart once
  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, "dark");
    }

    const observer = new ResizeObserver(() => {
      chartInstance.current?.resize();
    });

    observer.observe(chartRef.current);

    return () => {
      observer.disconnect();
      if (fadeTimerRef.current) {
        window.clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  // update chart on period change (без анимаций апдейта)
  useEffect(() => {
    const chart = chartInstance.current;
    if (!chart) return;

    const filteredHistory = filterHistoryByPeriod(history, period);
    const { timestamps, percentValues } = buildPortfolioSeries(
      filteredHistory,
      period
    );

    if (!percentValues.length) return;

    const option = buildPortfolioChartOption(timestamps, percentValues);

    chart.setOption(option, { notMerge: true, lazyUpdate: false });
  }, [period]);

  const switchPeriod = (next: Period) => {
    if (next === period) return;

    if (fadeTimerRef.current) {
      window.clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }

    // fade out
    setIsFading(true);

    // after fade out, switch data, then fade in automatically (state)
    fadeTimerRef.current = window.setTimeout(() => {
      setPeriod(next);
      setIsFading(false);
      fadeTimerRef.current = null;
    }, FADE_MS);
  };

  return (
    <div>
      <div className="btn-group mb-3">
        <button
          className={`btn btn-sm ${
            period === "year" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => switchPeriod("year")}
        >
          Year
        </button>

        <button
          className={`btn btn-sm ${
            period === "month" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => switchPeriod("month")}
        >
          Month
        </button>

        <button
          className={`btn btn-sm ${
            period === "week" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => switchPeriod("week")}
        >
          Week
        </button>
      </div>

      <div
        style={{
          opacity: isFading ? 0 : 1,
          transition: `opacity ${FADE_MS}ms linear`,
        }}
      >
        <div ref={chartRef} style={{ width: "100%", height: "350px" }} />
      </div>
    </div>
  );
}
