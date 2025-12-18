import { SparklineBase } from "../../charts/SparklineBase";

function formatMarketCap(v: number) {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(2)}K`;
  return `$${v}`;
}

type Props = {
  capUsd: number;
  changePct: number;
  spark: number[];
};

export function MarketCapCard({ capUsd, changePct, spark }: Props) {
  const isUp = changePct >= 0;

  // Sparkline всегда акцентная
  const sparkColor = "var(--primary)";

  return (
    <div
      className="card card-sm mb-3 h-100"
      style={{
        flex: 1,
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="card-body" style={{ padding: "12px 16px" }}>
        <div className="d-flex justify-content-between mb-1">
          <div style={{ color: "var(--text-muted)" }}>Market Cap</div>

          <div
            style={{
              color: isUp ? "var(--positive)" : "var(--negative)",
              fontWeight: 500,
            }}
          >
            {isUp ? "+" : ""}
            {changePct.toFixed(2)}%
          </div>
        </div>

        <div
          style={{
            fontSize: "1.45rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.15,
          }}
        >
          {formatMarketCap(capUsd)}
        </div>

        {/* ⬇️ сдвиг вниз */}
        <div style={{ marginTop: 22 }}>
          <SparklineBase
            values={spark}
            color={sparkColor}
            height={30}
            fullWidth={true}
          />
        </div>
      </div>
    </div>
  );
}
