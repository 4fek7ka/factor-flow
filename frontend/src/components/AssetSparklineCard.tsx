import React from "react";

type Props = {
  name: string;
  values: number[];
  pct: number;
};

export function AssetSparklineCard({ name, values, pct }: Props) {
  if (!values.length) return null;

  // normalize data for sparkline
  const w = 120;
  const h = 40;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  const isUp = pct >= 0;
  const color = isUp ? "#27a95e" : "#e11c14";
  const pctStr = `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;

  return (
    <div className="card card-sm" style={{ flex: 1 }}>
      <div className="card-body">
        {/* header */}
        <div className="d-flex justify-content-between mb-1">
          <div className="text-muted">{name}</div>
          <div style={{ color }}>{pctStr}</div>
        </div>

        {/* sparkline */}
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
