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
    <div
      className="card card-sm mb-3 h-100"
      style={{
        flex: 1, // ⭐ позволяет карточке растянуться по ширине
      }}
    >
      <div className="card-body" style={{ padding: "12px 16px" }}>
        <div className="d-flex justify-content-between mb-1">
          <div className="text-muted">Market Cap</div>
          <div className={isUp ? "text-success" : "text-danger"}>
            {changePct >= 0 ? "+" : ""}
            {changePct.toFixed(2)}%
          </div>
        </div>

        <div className="h2 m-0">{formatMarketCap(capUsd)}</div>

        <div style={{ marginTop: 6 }}>
          <SparklineBase
            values={spark}
            color={color}
            width={200}   // можно заменить на 100% если нужно
            height={30}
            fullWidth={true} // ⭐ Sparkline тянется на всю ширину
          />
        </div>
      </div>
    </div>
  );
}
