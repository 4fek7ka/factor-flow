import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import type { EChartsCoreOption, EChartsType } from "echarts/core";

import { LineChart, CustomChart } from "echarts/charts";
import { TooltipComponent, GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  LineChart,
  CustomChart,
  TooltipComponent,
  GridComponent,
  CanvasRenderer,
]);

const TARGET_POINTS = 250;

const BOUND_COLOR = "#64748b";
const RANGE_FILL = "rgba(255, 255, 255, 0.12)";

export type SimulationChartCardProps = {
  timestamps: number[];
  median: number[];
  representative: number[];
  upper: number[];
  lower: number[];
  cloud: number[][];
  showCloud: boolean;
  showMedian: boolean;
  showRepresentative?: boolean;
  showRange: boolean;

  onToggleCloud?: () => void;
  onToggleMedian?: () => void;
  onToggleRepresentative?: () => void;
  onToggleRange?: () => void;
};

function resample<T>(arr: T[], target: number): T[] {
  if (arr.length <= target) return arr;

  const res: T[] = [];
  const step = (arr.length - 1) / (target - 1);

  for (let i = 0; i < target; i++) {
    res.push(arr[Math.round(i * step)]);
  }

  return res;
}

function toPercentFromBase(values: number[], base: number): number[] {
  if (values.length === 0) return values;
  if (!Number.isFinite(base) || base === 0) return values.map(() => 0);
  return values.map((v) => ((v - base) / base) * 100);
}

export function SimulationChartCard({
  timestamps,
  median,
  representative,
  upper,
  lower,
  cloud,
  showCloud,
  showMedian,
  showRepresentative = true,
  showRange,
  onToggleCloud,
  onToggleMedian,
  onToggleRepresentative,
  onToggleRange,
}: SimulationChartCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType | null>(null);
  const yDomainRef = useRef<{ min: number; max: number } | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const chart = echarts.init(ref.current);
    chartRef.current = chart;

    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const baseCandidate =
      (median.length ? median[0] : undefined) ??
      (representative.length ? representative[0] : undefined) ??
      1;

    const base =
      Number.isFinite(baseCandidate) && baseCandidate !== 0
        ? baseCandidate
        : 1;

    const medianPct = toPercentFromBase(median, base);
    const repPct = toPercentFromBase(representative, base);
    const upperPct = toPercentFromBase(upper, base);
    const lowerPct = toPercentFromBase(lower, base);
    const cloudPct = cloud.map((p) => toPercentFromBase(p, base));

    if (!yDomainRef.current) {
      const all = [
        ...medianPct,
        ...repPct,
        ...upperPct,
        ...lowerPct,
        ...cloudPct.flat(),
      ];

      const min = Math.min(...all);
      const max = Math.max(...all);
      const pad = (max - min) * 0.08;

      yDomainRef.current = {
        min: min - pad,
        max: max + pad,
      };
    }

    const yDomain = yDomainRef.current!;

    const ts = resample(timestamps, TARGET_POINTS);
    const med = resample(medianPct, TARGET_POINTS);
    const rep = resample(repPct, TARGET_POINTS);
    const up = resample(upperPct, TARGET_POINTS);
    const low = resample(lowerPct, TARGET_POINTS);

    const cloudOpacity = showCloud ? 0.22 : 0;
    const medianOpacity = showMedian ? 0.6 : 0;
    const repOpacity = showRepresentative ? 0.9 : 0;
    const rangeOpacity = showRange ? 1 : 0;

    const option: EChartsCoreOption = {
      backgroundColor: "transparent",

      animationDurationUpdate: 300,
      animationEasingUpdate: "cubicOut",

      tooltip: {
        trigger: "axis",
        valueFormatter: (v: number) => `${v.toFixed(2)}%`,
      },

      grid: {
        left: 40,
        right: 24,
        top: 44,
        bottom: 40,
      },

      xAxis: {
        type: "value",
        min: 0,
        max: ts[ts.length - 1],
        animation: false,
        axisLabel: {
          color: "#94a3b8",
          formatter: (v: number) => `${Math.round(v)}d`,
        },
        axisLine: { lineStyle: { color: "#334155" } },
        splitLine: { lineStyle: { color: "#1e293b" } }, // вертикальные линии ОСТАЛИСЬ
      },

      yAxis: {
        type: "value",
        min: yDomain.min,
        max: yDomain.max,
        animation: false,
        axisLabel: {
          color: "#94a3b8",
          formatter: (v: number) => {
            if (v === yDomain.min || v === yDomain.max) return "";
            return `${v}%`;
          },
        },
        axisLine: { lineStyle: { color: "#334155" } },
        splitLine: {
          show: false, // ⬅️ ГОРИЗОНТАЛЬНЫЕ ЛИНИИ УБРАНЫ
        },
      },

      series: [
        ...cloudPct.map((p) => ({
          type: "line",
          data: ts.map((t, i) => [t, resample(p, TARGET_POINTS)[i]]),
          showSymbol: false,
          silent: true,
          animation: false,
          tooltip: { show: false },
          emphasis: { disabled: true },
          lineStyle: {
            color: "#64748b",
            width: 1,
            opacity: cloudOpacity,
          },
          z: 1,
        })),

        {
          type: "custom",
          silent: true,
          animation: false,
          data: [0],
          z: 2,
          renderItem: (_p: unknown, api: unknown) => {
            if (!showRange) return null;

            const a = api as any;
            const points: number[][] = [];

            for (let i = 0; i < ts.length; i++) {
              points.push(a.coord([ts[i], up[i]]));
            }
            for (let i = ts.length - 1; i >= 0; i--) {
              points.push(a.coord([ts[i], low[i]]));
            }

            return {
              type: "polygon",
              shape: { points },
              style: {
                fill: RANGE_FILL,
                opacity: rangeOpacity,
              },
            };
          },
        },

        {
          type: "line",
          data: ts.map((t, i) => [t, low[i]]),
          showSymbol: false,
          animation: false,
          silent: true,
          lineStyle: {
            color: BOUND_COLOR,
            width: 2,
            opacity: showRange ? 0.7 : 0,
          },
          z: 4,
        },

        {
          type: "line",
          data: ts.map((t, i) => [t, up[i]]),
          showSymbol: false,
          animation: false,
          silent: true,
          lineStyle: {
            color: BOUND_COLOR,
            width: 2,
            opacity: showRange ? 0.7 : 0,
          },
          z: 4,
        },

        {
          type: "line",
          data: ts.map((t, i) => [t, med[i]]),
          showSymbol: false,
          tooltip: showMedian ? undefined : { show: false },
          emphasis: showMedian ? undefined : { disabled: true },
          lineStyle: {
            color: "#ef4444",
            width: 2,
            type: "dashed",
            opacity: medianOpacity,
          },
          z: 10,
        },

        {
          type: "line",
          data: ts.map((t, i) => [t, rep[i]]),
          showSymbol: false,
          tooltip: showRepresentative ? undefined : { show: false },
          emphasis: showRepresentative ? undefined : { disabled: true },
          lineStyle: {
            color: "#0ea5e9",
            width: 2,
            opacity: repOpacity,
          },
          z: 8,
        },
      ],
    };

    chart.setOption(option, { notMerge: true });
  }, [
    timestamps,
    median,
    representative,
    upper,
    lower,
    cloud,
    showCloud,
    showMedian,
    showRepresentative,
    showRange,
  ]);

  const canToggle = {
    rep: typeof onToggleRepresentative === "function",
    range: typeof onToggleRange === "function",
    median: typeof onToggleMedian === "function",
    cloud: typeof onToggleCloud === "function",
  };

  return (
    <div style={{ position: "relative", width: "100%", height: 380 }}>
      <style>{`
        .sim-legend {
          position: absolute;
          top: 10px;
          left: 12px;
          display: flex;
          gap: 12px;
          z-index: 3;
          align-items: center;
          user-select: none;
          padding: 6px 8px;
          border-radius: 10px;
          background: rgba(2, 6, 23, 0.35);
          border: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
        }

        .sim-legend-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 800;
          padding: 4px 6px;
          border-radius: 8px;
          cursor: pointer;
          color: rgba(226,232,240,0.75);
        }

        .sim-legend-item.is-on {
          color: rgba(226,232,240,0.96);
        }

        .sim-legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
        }
      `}</style>

      <div className="sim-legend">
        <div
          className={[
            "sim-legend-item",
            showRepresentative ? "is-on" : "",
            canToggle.rep ? "" : "is-disabled",
          ].join(" ")}
          onClick={() => canToggle.rep && onToggleRepresentative?.()}
        >
          <span className="sim-legend-dot" style={{ background: "#0ea5e9" }} />
          Main
        </div>

        <div
          className={[
            "sim-legend-item",
            showRange ? "is-on" : "",
            canToggle.range ? "" : "is-disabled",
          ].join(" ")}
          onClick={() => canToggle.range && onToggleRange?.()}
        >
          <span className="sim-legend-dot" style={{ background: BOUND_COLOR }} />
          Range
        </div>

        <div
          className={[
            "sim-legend-item",
            showMedian ? "is-on" : "",
            canToggle.median ? "" : "is-disabled",
          ].join(" ")}
          onClick={() => canToggle.median && onToggleMedian?.()}
        >
          <span className="sim-legend-dot" style={{ background: "#ef4444" }} />
          Median
        </div>

        <div
          className={[
            "sim-legend-item",
            showCloud ? "is-on" : "",
            canToggle.cloud ? "" : "is-disabled",
          ].join(" ")}
          onClick={() => canToggle.cloud && onToggleCloud?.()}
        >
          <span className="sim-legend-dot" style={{ background: "#64748b" }} />
          Cloud
        </div>
      </div>

      <div ref={ref} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
