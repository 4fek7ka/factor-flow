import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import type { EChartsType } from "echarts/core";

import { LineChart, CustomChart } from "echarts/charts";
import { TooltipComponent, GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

import { resample, toPercentFromBase } from "./simulationChart.utils";
import { buildSimulationChartOption } from "./simulationChart.option";

echarts.use([
  LineChart,
  CustomChart,
  TooltipComponent,
  GridComponent,
  CanvasRenderer,
]);

const TARGET_POINTS = 250;
const BOUND_COLOR = "#64748b";

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

      yDomainRef.current = { min: min - pad, max: max + pad };
    }

    const ts = resample(timestamps, TARGET_POINTS);
    const option = buildSimulationChartOption({
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
      },
    });

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
