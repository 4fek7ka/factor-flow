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

    return { bins, min, max, median, medianPos };
  }, [paths]);

  if (!model) return null;

  /* =========================
     🎨 COLORS
  ========================= */

  const BAR_COLOR = "rgba(187,134,252,0.55)";
  const MEDIAN_COLOR = "#7dd3fc"; // светло-голубая

  return (
    <div
      className="card card-sm w-100"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="card-body">
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            {title}
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              median
            </div>
            <div style={{ fontWeight: 700, color: MEDIAN_COLOR }}>
              {formatMoney(model.median)}
            </div>
          </div>
        </div>

        {/* DISTRIBUTION */}
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
                height: `${Math.max(0.06, v) * 100}%`,
                borderRadius: 4,
                background: BAR_COLOR,
                transition: "height 200ms ease",
              }}
            />
          ))}

          {/* MEDIAN LINE — ЧУТЬ ТОЛЩЕ */}
          <div
            style={{
              position: "absolute",
              left: `${model.medianPos}%`,
              top: -8,
              bottom: -8,
              transform: "translateX(-50%)",
              width: 4,            // 👈 было 3
              background: MEDIAN_COLOR,
              borderRadius: 999,
            }}
          />
        </div>

        {/* FOOTER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          <div>{formatMoney(model.min)}</div>
          <div>{formatMoney(model.max)}</div>
        </div>
      </div>
    </div>
  );
}
