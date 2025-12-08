import  { useMemo } from "react";
import type { HistoryPoint } from "../services/portfolioService";
import { AssetSparklineCard } from "./AssetSparklineCard";

type Props = {
  history: HistoryPoint[];
};

const ASSETS = ["ETH", "WBTC", "USDC", "DAI", "UNI"] as const;

/* ----------------------------------
   📌 Downsampling до N точек
----------------------------------- */
function downsample(values: number[], target: number) {
  const n = values.length;
  if (n <= target) return values;

  const step = Math.ceil(n / target);
  const out: number[] = [];

  for (let i = 0; i < n; i += step) {
    out.push(values[i]);
  }

  return out;
}

/* ----------------------------------
   📌 Основной компонент
----------------------------------- */
export function AssetSparklinesSection({ history }: Props) {
  const data = useMemo(() => {
    if (!history.length) return [];

    // timestamp последней точки
    const lastTs = history[history.length - 1].timestamp;

    // 24 часа в секундах
    const cutoff = lastTs - 24 * 3600;

    // Берём последние 24 часа
    const last24h = history.filter((p) => p.timestamp >= cutoff);

    // Если мало данных – fallback
    const src = last24h.length > 1 ? last24h : history.slice(-24);

    return ASSETS.map((asset) => {
      const rawValues = src.map((p) => p.prices[asset]);

      const first = rawValues[0];
      const last = rawValues[rawValues.length - 1];
      const pct = first ? ((last - first) / first) * 100 : 0;

      // Downsampling до 60 точек
      const values = downsample(rawValues, 13);

      return {
        name: asset,
        values,
        pct,
      };
    });
  }, [history]);

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
              label="24H"  // ← теперь работает
            />
          ))}
        </div>
      </div>
    </div>
  );
}
