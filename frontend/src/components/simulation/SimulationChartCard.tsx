// SimulationChartCard.tsx
import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import type { EChartsType } from "echarts/core";

import { LineChart, CustomChart } from "echarts/charts";
import { TooltipComponent, GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

import {
  resample,
  resampleFan,
  toPercentFromBase,
  buildFanQuantiles,
} from "./simulationChart.utils";
import { buildSimulationChartOption } from "./simulationChart.option";

echarts.use([
  LineChart,
  CustomChart,
  TooltipComponent,
  GridComponent,
  CanvasRenderer,
]);

const TARGET_POINTS = 250;

const ACTIVE_COLOR = "#0ea5e9";
const INACTIVE_COLOR = "#64748b";
const TEXT_ACTIVE = "rgba(226,232,240,0.95)";
const TEXT_INACTIVE = "rgba(226,232,240,0.80)";

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

  // Quantile Fan
  showFan?: boolean;

  onToggleCloud?: () => void;
  onToggleMedian?: () => void;
  onToggleRepresentative?: () => void;
  onToggleRange?: () => void;

  // Quantile Fan
  onToggleFan?: () => void;
};

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
  showFan = false,
  onToggleCloud,
  onToggleMedian,
  onToggleRepresentative,
  onToggleRange,
  onToggleFan,
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

    const baseCandidate = median[0] ?? representative[0] ?? 1;
    const base =
      Number.isFinite(baseCandidate) && baseCandidate !== 0
        ? baseCandidate
        : 1;

    const medianPct = toPercentFromBase(median, base);
    const repPct = toPercentFromBase(representative, base);
    const upperPct = toPercentFromBase(upper, base);
    const lowerPct = toPercentFromBase(lower, base);
    const cloudPct = cloud.map((p) => toPercentFromBase(p, base));

    const fanPctRaw = buildFanQuantiles(cloudPct);
    const fanPct = fanPctRaw ? resampleFan(fanPctRaw, TARGET_POINTS) : null;

    if (!yDomainRef.current) {
      const all = [
        ...medianPct,
        ...repPct,
        ...upperPct,
        ...lowerPct,
        ...cloudPct.flat(),
        ...(fanPct
          ? [
              ...fanPct.q05,
              ...fanPct.q25,
              ...fanPct.q50,
              ...fanPct.q75,
              ...fanPct.q95,
            ]
          : []),
      ];
      const min = Math.min(...all);
      const max = Math.max(...all);
      const pad = (max - min) * 0.08;
      yDomainRef.current = { min: min - pad, max: max + pad };
    }

    const ts = resample(timestamps, TARGET_POINTS);

    chart.setOption(
      buildSimulationChartOption({
        timestamps: ts,
        median: resample(medianPct, TARGET_POINTS),
        representative: resample(repPct, TARGET_POINTS),
        upper: resample(upperPct, TARGET_POINTS),
        lower: resample(lowerPct, TARGET_POINTS),
        cloud: cloudPct.map((p) => resample(p, TARGET_POINTS)),
        yDomain: yDomainRef.current!,
        flags: {
          showCloud,
          showMedian,
          showRepresentative,
          showRange,
          showFan,
        },
        fan: fanPct ?? undefined,
      }),
      { notMerge: true }
    );
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
    showFan,
  ]);

  return (
    <div style={{ position: "relative", width: "100%", height: 380 }}>
      <style>{`
        .sim-legend {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 16px;
          z-index: 3;
          padding: 6px 12px;
          border-radius: 12px;
          background: rgba(2,6,23,0.35);
          border: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
        }

        .sim-legend-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          line-height: 1;
          cursor: pointer;
          user-select: none;
          color: ${TEXT_INACTIVE};
        }

        .sim-legend-item.is-on {
          color: ${TEXT_ACTIVE};
        }

        .sim-legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: ${INACTIVE_COLOR};
          transition: background 120ms ease;
          flex-shrink: 0;
        }

        .sim-legend-item.is-on .sim-legend-dot {
          background: ${ACTIVE_COLOR};
        }
      `}</style>

      <div className="sim-legend">
        {/* 1) Main */}
        <div
          className={`sim-legend-item ${showRepresentative ? "is-on" : ""}`}
          onClick={onToggleRepresentative}
        >
          <span className="sim-legend-dot" />
          Main
        </div>

        {/* 2) Fan */}
        <div
          className={`sim-legend-item ${showFan ? "is-on" : ""}`}
          onClick={onToggleFan}
        >
          <span className="sim-legend-dot" />
          Fan
        </div>

        {/* 3) Median */}
        <div
          className={`sim-legend-item ${showMedian ? "is-on" : ""}`}
          onClick={onToggleMedian}
        >
          <span className="sim-legend-dot" />
          Median
        </div>

        {/* 4) Cloud */}
        <div
          className={`sim-legend-item ${showCloud ? "is-on" : ""}`}
          onClick={onToggleCloud}
        >
          <span className="sim-legend-dot" />
          Cloud
        </div>

        {/* 5) Range (last) */}
        <div
          className={`sim-legend-item ${showRange ? "is-on" : ""}`}
          onClick={onToggleRange}
        >
          <span className="sim-legend-dot" />
          Range
        </div>
      </div>

      <div ref={ref} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
