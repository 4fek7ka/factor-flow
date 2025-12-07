import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import history from "../data/mock-history.json";

import {
  buildPortfolioSeries,
  filterHistoryByPeriod,
} from "../services/portfolioService";
import type { Period } from "../services/portfolioService";

import { buildPortfolioChartOption } from "../charts/portfolioChartOptions";

const EVAP_MS = 100; // ✅ было 260
const EVAP_BLUR_PX = 6;

export function PortfolioChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const [period, setPeriod] = useState<Period>("year");

  const [fadeOpacity, setFadeOpacity] = useState(1);
  const [fadeBlur, setFadeBlur] = useState(0);
  const [transitionOn, setTransitionOn] = useState(true);

  const seriesCounterRef = useRef(0);
  const seriesIdRef = useRef("portfolio-line-0");

  const transitioningRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current, "dark");
    const chart = chartInstance.current;

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(chartRef.current);

    return () => {
      observer.disconnect();
      if (timerRef.current) window.clearTimeout(timerRef.current);
      chart.dispose();
      chartInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartInstance.current;
    if (!chart) return;

    const filteredHistory = filterHistoryByPeriod(history, period);
    const { timestamps, percentValues } = buildPortfolioSeries(
      filteredHistory,
      period
    );

    if (!percentValues.length) return;

    const option = buildPortfolioChartOption(timestamps, percentValues, {
      seriesId: seriesIdRef.current,
      initial: true,
      opacity: 1,
    });

    chart.setOption(option, { notMerge: true, lazyUpdate: false });
  }, [period]);

  const switchPeriod = (next: Period) => {
    if (next === period) return;
    if (transitioningRef.current) return;

    transitioningRef.current = true;

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setTransitionOn(true);
    setFadeOpacity(0);
    setFadeBlur(EVAP_BLUR_PX);

    timerRef.current = window.setTimeout(() => {
      seriesCounterRef.current += 1;
      seriesIdRef.current = `portfolio-line-${seriesCounterRef.current}`;

      setTransitionOn(false);
      setFadeOpacity(1);
      setFadeBlur(0);

      setPeriod(next);

      requestAnimationFrame(() => setTransitionOn(true));

      transitioningRef.current = false;
      timerRef.current = null;
    }, EVAP_MS);
  };

  const tabClass = (key: Period) =>
    `btn btn-sm ${period === key ? "btn-purple" : "btn-outline-purple"}`;

  return (
    <div>
      <style>{`
        .btn-purple {
          --tblr-btn-bg: #b351f9;
          --tblr-btn-border-color: #b351f9;
          --tblr-btn-color: #fff;
          --tblr-btn-hover-bg: #a449e8;
          --tblr-btn-hover-border-color: #a449e8;
          --tblr-btn-active-bg: #9440d7;
          --tblr-btn-active-border-color: #9440d7;
        }
        .btn-outline-purple {
          --tblr-btn-color: #b351f9;
          --tblr-btn-border-color: #b351f9;
          --tblr-btn-hover-bg: #b351f9;
          --tblr-btn-hover-border-color: #b351f9;
          --tblr-btn-hover-color: #fff;
          --tblr-btn-active-bg: #a449e8;
          --tblr-btn-active-border-color: #a449e8;
          --tblr-btn-active-color: #fff;
        }
      `}</style>

      <div className="btn-group mb-3">
        <button className={tabClass("year")} onClick={() => switchPeriod("year")}>
          Year
        </button>
        <button
          className={tabClass("month")}
          onClick={() => switchPeriod("month")}
        >
          Month
        </button>
        <button className={tabClass("week")} onClick={() => switchPeriod("week")}>
          Week
        </button>
      </div>

      <div
        style={{
          opacity: fadeOpacity,
          filter: `blur(${fadeBlur}px)`,
          transition: transitionOn
            ? `opacity ${EVAP_MS}ms ease-in-out, filter ${EVAP_MS}ms ease-in-out`
            : "none",
        }}
      >
        <div ref={chartRef} style={{ width: "100%", height: "350px" }} />
      </div>
    </div>
  );
}
