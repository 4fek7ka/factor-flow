import { useMemo } from "react";
import type { HistoryPoint } from "../../services/portfolio/portfolioService";
import { AssetSparklineCard } from "./AssetSparklineCard";

type Props = {
  history: HistoryPoint[];
  symbols?: string[];
};

function downsample(values: number[], target: number) {
  const n = values.length;
  if (n <= target) return values;

  const step = Math.ceil(n / target);
  const out: number[] = [];

  for (let i = 0; i < n; i += step) out.push(values[i]);

  if (out[out.length - 1] !== values[n - 1]) out.push(values[n - 1]);
  return out;
}

export function AssetSparklinesSection({ history, symbols }: Props) {
  const data = useMemo(() => {
    if (!history.length) return [];

    const lastTs = history[history.length - 1].timestamp;
    const cutoff = lastTs - 24 * 3600;

    const last24h = history.filter((p) => p.timestamp >= cutoff);
    const src = last24h.length > 1 ? last24h : history.slice(-24);

    const list = (symbols && symbols.length ? symbols : ["ETH", "BTC", "USDC", "SOL", "BNB"])
      .slice(0, 5);

    return list.map((asset) => {
      const rawValues = src.map((p) => p.prices[asset] ?? 0).filter((v) => v > 0);

      if (rawValues.length < 2) {
        return {
          name: asset,
          values: [],
          pct: 0,
        };
      }

      const first = rawValues[0];
      const last = rawValues[rawValues.length - 1];
      const pct = first ? ((last - first) / first) * 100 : 0;

      const values = downsample(rawValues, 13);

      return {
        name: asset,
        values,
        pct,
      };
    });
  }, [history, symbols]);

  return (
    <div className="row row-cards mt-3">
      <div className="col-12">
        <div
          style={{
            display: "flex",
            gap: "16px",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          {data.map((d) => (
            <AssetSparklineCard
              key={d.name}
              name={d.name}
              values={d.values}
              pct={d.pct}
              label="24H"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
