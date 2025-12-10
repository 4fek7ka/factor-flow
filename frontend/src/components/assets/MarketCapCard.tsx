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
  const color = isUp ? "#22c55e" : "#ef4444";

  return (
    <div className="card card-sm mb-3">
      <style>{`
        .fade-number {
          opacity: 0;
          animation: fadeIn 220ms ease-out forwards;
        }
        .fade-sub {
          opacity: 0;
          animation: fadeIn 220ms ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div className="card-body">
        {/* Header */}
        <div className="d-flex justify-content-between mb-1">
          <div className="text-muted">Market Cap</div>
          <div className={isUp ? "text-success" : "text-danger"}>
            {changePct >= 0 ? "+" : ""}
            {changePct.toFixed(2)}%
          </div>
        </div>

        {/* Market Cap Value */}
        <div
          className={`h2 m-0 fade-number ${
            isUp ? "text-success" : "text-danger"
          }`}
        >
          {formatMarketCap(capUsd)}
        </div>

        {/* full-width sparkline */}
        <div className="mt-2" style={{ width: "100%" }}>
          <SparklineBase
            values={spark}
            color={color}
            width={200}   // viewBox width
            height={45}   // fixed height
            fullWidth={true}
          />
        </div>
      </div>
    </div>
  );
}
