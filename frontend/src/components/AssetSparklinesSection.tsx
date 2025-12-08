import React, { useMemo } from "react";
import type { HistoryPoint, Period } from "../services/portfolioService";
import { filterHistoryByPeriod } from "../services/portfolioService";
import { AssetSparklineCard } from "./AssetSparklineCard";

type Props = {
  history: HistoryPoint[];
  period: Period;
};

const ASSETS = ["ETH", "WBTC", "USDC", "DAI", "UNI"] as const;

export function AssetSparklinesSection({ history }: Props) {
  // 🔥 всегда берём только неделю для маленьких графиков
  const sparkHistory = useMemo(
    () => filterHistoryByPeriod(history, "week"),
    [history]
  );

  const data = useMemo(() => {
    return ASSETS.map((asset) => {
      const values = sparkHistory.map((p) => p.prices[asset]);
      const first = values[0];
      const last = values[values.length - 1];
      const pct = first ? ((last - first) / first) * 100 : 0;

      return { name: asset, values, pct };
    });
  }, [sparkHistory]);

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
            />
          ))}
        </div>
      </div>
    </div>
  );
}
