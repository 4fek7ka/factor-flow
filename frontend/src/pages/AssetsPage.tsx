import { useMemo } from "react";
import historyJson from "../data/mock-history.json";

import type { HistoryPoint } from "../services/portfolioService";
import { buildAssetsTable } from "../services/assetsService";

import { AssetsTable } from "../components/assets/AssetsTable";
import { MarketCapCard } from "../components/assets/MarketCapCard";
import { FearGreedCard } from "../components/assets/FearGreedCard";
import { BtcEthAltCard } from "../components/assets/BtcEthAltCard";
import { TopGainer7dCard } from "../components/assets/TopGainer7dCard";

export function AssetsPage() {
  const history = historyJson as unknown as HistoryPoint[];
  const assets = useMemo(() => buildAssetsTable(history), [history]);

  // Фейковые данные
  const fakeMarketCap = 3_140_000_000_000;
  const fakeChangePct = 1.75;
  const fakeSpark = [1, 2, 3, 5, 4, 5, 5.2, 5.1, 5.3];
  const fakeFearIndex = 30;

  const fakeBtcDom = 52.0;
  const fakeEthDom = 12.8;
  const fakeAltDom = 100 - fakeBtcDom - fakeEthDom;

  const fakeVolume24hUsd = 180_000_000_000;

  // Бутафорный топ-гейнер (7 дней)
  const fakeTopGainer = {
    name: "Solana",
    symbol: "SOL",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    pct7d: 32.45,
  };

  return (
    <div>
      <div className="page-header mb-2">
        <h2 className="page-title">Assets</h2>
        <div className="text-muted">Market overview (24h)</div>
      </div>

      <div className="row row-cards mb-2">
        {/* Market Cap */}
        <div className="col-12 col-md-6 col-lg-3 d-flex">
          <MarketCapCard
            capUsd={fakeMarketCap}
            changePct={fakeChangePct}
            spark={fakeSpark}
          />
        </div>

        {/* Fear & Greed */}
        <div className="col-12 col-md-6 col-lg-3 d-flex">
          <FearGreedCard value={fakeFearIndex} />
        </div>

        {/* BTC / ETH / ALT Dominance */}
        <div className="col-12 col-md-6 col-lg-3 d-flex">
          <BtcEthAltCard btc={fakeBtcDom} eth={fakeEthDom} alt={fakeAltDom} />
        </div>

        {/* Top Gainer (7d) */}
        <div className="col-12 col-md-6 col-lg-3 d-flex">
          <TopGainer7dCard
            name={fakeTopGainer.name}
            symbol={fakeTopGainer.symbol}
            image={fakeTopGainer.image}
            pct7d={fakeTopGainer.pct7d}
          />
        </div>
      </div>

      <AssetsTable assets={assets} />
    </div>
  );
}
