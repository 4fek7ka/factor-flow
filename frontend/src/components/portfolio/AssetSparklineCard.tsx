import { SparklineBase } from "../../charts/SparklineBase";

type Props = {
  name: string;
  values: number[];
  pct: number;
  label?: string;
};

export function AssetSparklineCard({ name, values, pct, label }: Props) {
  if (!values.length) return null;

  const isUp = pct >= 0;
  const color = isUp ? "#22c55e" : "#ef4444";
  const pctStr = `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;

  return (
    <div className="card card-sm" style={{ flex: 1, minWidth: 150 }}>
      <div className="card-body">
        {/* header */}
        <div className="d-flex justify-content-between mb-1">
          <div className="text-muted">{name}</div>
          <div style={{ color }}>{pctStr}</div>
        </div>

        {/* период */}
        {label && (
          <div
            style={{
              fontSize: 12,
              color: "#888",
              marginTop: -2,
              marginBottom: 6,
            }}
          >
            {label}
          </div>
        )}

        {/* unified sparkline */}
        <SparklineBase values={values} color={color} width={120} height={40} />
      </div>
    </div>
  );
}
