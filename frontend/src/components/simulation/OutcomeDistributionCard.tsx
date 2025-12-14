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
    if (!paths.length) return null;

    const finals = paths
      .map((p) => p[p.length - 1])
      .filter(Number.isFinite)
      .sort((a, b) => a - b);

    if (!finals.length) return null;

    const min = finals[0];
    const max = finals[finals.length - 1];
    const median = medianOf(finals);

    const BUCKETS = 12;
    const counts = Array(BUCKETS).fill(0);
    const step = (max - min) / BUCKETS || 1;

    for (const v of finals) {
      const i = Math.min(
        BUCKETS - 1,
        Math.floor((v - min) / step)
      );
      counts[i]++;
    }

    const maxCount = Math.max(...counts) || 1;
    const bins = counts.map((c) => c / maxCount);

    const medianPos =
      ((median - min) / (max - min || 1)) * 100;

    return { bins, min, max, median, medianPos };
  }, [paths]);

  if (!model) return null;

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
                color: "rgba(226,232,240,0.95)",
              }}
            >
              {formatMoney(model.median)}
            </div>
          </div>
        </div>

        {/* histogram */}
        <div
          style={{
            position: "relative",
            height: 72,
            display: "flex",
            alignItems: "flex-end",
            gap: 6,
          }}
        >
          {model.bins.map((v, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${Math.max(0.08, v) * 100}%`,
                borderRadius: 6,
                background:
                  "linear-gradient(180deg, rgba(14,165,233,0.85), rgba(14,165,233,0.4))",
                transition: "height 200ms ease",
              }}
            />
          ))}

          {/* median */}
          <div
            style={{
              position: "absolute",
              left: `${model.medianPos}%`,
              bottom: 0,
              transform: "translateX(-1px)",
              width: 2,
              height: "100%",
              background: "#22c55e",
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
