import { useMemo } from "react";
import historyJson from "../data/mock-history.json";

import type { HistoryPoint } from "../services/portfolioService";
import { buildAssetsTable } from "../services/assetsService";
import { AssetsTable } from "../components/assets/AssetsTable";

export function AssetsPage() {
  const history = historyJson as unknown as HistoryPoint[];

  const assets = useMemo(() => buildAssetsTable(history), [history]);

  return (
    <div>
      <div className="page-header mb-3">
        <h2 className="page-title">Assets</h2>
        <div className="text-muted">Market overview (24h)</div>
      </div>

      <AssetsTable assets={assets} />
    </div>
  );
}
