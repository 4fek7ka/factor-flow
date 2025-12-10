import { useMemo } from "react";
import historyJson from "../data/mock-history.json";

import type { HistoryPoint } from "../services/portfolioService";
import { buildAssetsTable } from "../services/assetsService";
import { AssetsTable } from "../components/assets/AssetsTable";
import { MarketCapCard } from "../components/assets/MarketCapCard";
import { FearGreedCard } from "../components/assets/FearGreedCard";

export function AssetsPage() {
  const history = historyJson as unknown as HistoryPoint[];
  const assets = useMemo(() => buildAssetsTable(history), [history]);

  const fakeMarketCap = 3_140_000_000_000;
  const fakeChangePct = 1.75;
  const fakeSpark = [1, 2, 3, 5, 4, 5, 5.2, 5.1, 5.3];
  const fakeFearIndex = 30;

  return (
    <div>
      <div className="page-header mb-2">
        <h2 className="page-title">Assets</h2>
        <div className="text-muted">Market overview (24h)</div>
      </div>

      {/* Плотные карточки */}
      <div className="row row-cards mb-2">
        <div className="col-12 col-md-6 col-lg-4 d-flex">
          <MarketCapCard
            capUsd={fakeMarketCap}
            changePct={fakeChangePct}
            spark={fakeSpark}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-3 d-flex">
          <FearGreedCard value={fakeFearIndex} />
        </div>
      </div>

      <AssetsTable assets={assets} />
    </div>
  );
}
