import { useMemo } from "react";

type Props = {
  paths: number[][];
  title?: string;
};

function medianOf(sorted: number[]): number {
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
}

function formatMoney(v: number) {
  return v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function OutcomeDistributionCard({
  paths,
  title = "Outcome distribution",
}: Props) {
  const model = useMemo(() => {
    if (!paths.length || !paths[0]?.length) return null;

    const start = paths[0][0];

    const finals = paths
      .map((p) => p[p.length - 1])
      .filter(Number.isFinite)
      .sort((a, b) => a - b);

    if (!finals.length) return null;

    const min = finals[0];
    const max = finals[finals.length - 1];
    const median = medianOf(finals);

    const BUCKETS = 14;
    const counts = Array(BUCKETS).fill(0);
    const step = (max - min) / BUCKETS || 1;

    for (const v of finals) {
      const i = Math.min(BUCKETS - 1, Math.floor((v - min) / step));
      counts[i]++;
    }

    const maxCount = Math.max(...counts) || 1;
    const bins = counts.map((c) => c / maxCount);

    const medianPos = ((median - min) / (max - min || 1)) * 100;
    const isPositive = median >= start;

    return {
      bins,
      min,
      max,
      median,
      medianPos,
      isPositive,
    };
  }, [paths]);

  if (!model) return null;

  const MEDIAN_COLOR = model.isPositive ? "#22c55e" : "#ef4444";

  const BAR_GRADIENT = `linear-gradient(180deg,
    rgba(125,211,252,0.70) 0%,
    rgba(56,189,248,0.56) 45%,
    rgba(14,165,233,0.34) 100%
  )`;

  return (
    <div
      className="card card-sm w-100"
      style={{
        background: "#0f172a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="card-body">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: "rgba(226,232,240,0.95)",
            }}
          >
            {title}
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 12,
                color: "rgba(148,163,184,0.9)",
              }}
            >
              median
            </div>
            <div
              style={{
                fontWeight: 800,
                color: MEDIAN_COLOR,
              }}
            >
              {formatMoney(model.median)}
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            height: 72,
            display: "flex",
            alignItems: "flex-end",
            gap: 5,
          }}
        >
          {model.bins.map((v, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${Math.max(0.06, v) * 100}%`,
                borderRadius: 4,
                background: BAR_GRADIENT,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                transition: "height 200ms ease",
              }}
            />
          ))}

          {/* median marker: чуть толще + rounded ends */}
          <div
            style={{
              position: "absolute",
              left: `${model.medianPos}%`,
              top: -6,
              bottom: -6,
              transform: "translateX(-50%)",
              width: 3, // ← чуть толще (было 2)
              background: MEDIAN_COLOR,
              borderRadius: 999,
              boxShadow: "0 0 10px rgba(226,232,240,0.07)",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            fontSize: 12,
            color: "rgba(226,232,240,0.95)",
          }}
        >
          <div>min {formatMoney(model.min)}</div>
          <div>max {formatMoney(model.max)}</div>
        </div>
      </div>
    </div>
  );
}
