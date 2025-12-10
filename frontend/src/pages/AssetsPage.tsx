import { useMemo } from "react";
import historyJson from "../data/mock-history.json";

import type { HistoryPoint } from "../services/portfolioService";
import { buildAssetsTable } from "../services/assetsService";
import { AssetsTable } from "../components/assets/AssetsTable";
import { MarketCapCard } from "../components/assets/MarketCapCard";

export function AssetsPage() {
  const history = historyJson as unknown as HistoryPoint[];
  const assets = useMemo(() => buildAssetsTable(history), [history]);

  // Бутафорские данные для Market Cap
  const fakeMarketCap = 3_140_000_000_000; // 3.14T
  const fakeChangePct = 1.75;               // +1.75%
  const fakeSpark = [1, 2, 3, 5, 4, 5, 5.2, 5.1, 5.3, 5.4];

  return (
    <div>
      <div className="page-header mb-3">
        <h2 className="page-title">Assets</h2>
        <div className="text-muted">Market overview (24h)</div>
      </div>

      {/* Market Cap Metric */}
      <div className="row row-cards mb-3">
        <div className="col-12 col-md-6 col-lg-3">
          <MarketCapCard
            capUsd={fakeMarketCap}
            changePct={fakeChangePct}
            spark={fakeSpark}
          />
        </div>
      </div>

      <AssetsTable assets={assets} />
    </div>
  );
}
