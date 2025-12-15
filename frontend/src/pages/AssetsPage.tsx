import { useEffect, useMemo, useState } from "react";

import type { AssetRow } from "../services/assetsService";
import {
  getAssetsTableFromCache,
  getGlobalMarketCapWithBtcSurrogate,
  getDominance,
  getTopGainer7d,
  getFearGreedIndex,
} from "../services/assetsService";

import { fetchBinancePrices } from "../services/binanceService";

import { AssetsTable } from "../components/assets/AssetsTable";
import { MarketCapCard } from "../components/assets/MarketCapCard";
import { FearGreedCard } from "../components/assets/FearGreedCard";
import { BtcEthAltCard } from "../components/assets/BtcEthAltCard";
import { TopGainer7dCard } from "../components/assets/TopGainer7dCard";

export function AssetsPage() {
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});

  const [fearGreed, setFearGreed] = useState<number | null>(null);
  const [marketCap, setMarketCap] = useState<{
    capUsd: number;
    changePct24h: number;
    sparkline: number[];
  } | null>(null);

  const dominance = getDominance();
  const topGainer = getTopGainer7d();

  /* ===== BASE DATA (CoinGecko cache) ===== */
  useEffect(() => {
    setAssets(getAssetsTableFromCache());
    getGlobalMarketCapWithBtcSurrogate().then(setMarketCap);
    getFearGreedIndex().then(setFearGreed);
  }, []);

  // символы ровно тех активов, которые сейчас отрисовываются в таблице
  const visibleSymbols = useMemo(() => assets.map((a) => a.symbol), [assets]);

  /* ===== LIVE PRICES (Binance, 10s) ===== */
  useEffect(() => {
    if (!visibleSymbols.length) return;

    let active = true;

    async function tick() {
      try {
        const prices = await fetchBinancePrices();
        if (active) setLivePrices(prices);
      } catch {
        /* silent */
      }
    }

    tick();
    const id = setInterval(tick, 4_000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, [visibleSymbols]);

  return (
    <div>
      <div className="row row-cards mb-2">
        <div className="col-12 col-md-6 col-lg-3 d-flex">
          {marketCap && (
            <MarketCapCard
              capUsd={marketCap.capUsd}
              changePct={marketCap.changePct24h}
              spark={marketCap.sparkline}
            />
          )}
        </div>

        <div className="col-12 col-md-6 col-lg-3 d-flex">
          {fearGreed !== null && <FearGreedCard value={fearGreed} />}
        </div>

        <div className="col-12 col-md-6 col-lg-3 d-flex">
          {dominance && (
            <BtcEthAltCard
              btc={dominance.btc}
              eth={dominance.eth}
              alt={dominance.alt}
            />
          )}
        </div>

        <div className="col-12 col-md-6 col-lg-3 d-flex">
          {topGainer && (
            <TopGainer7dCard
              name={topGainer.name}
              symbol={topGainer.symbol}
              image={topGainer.image}
              pct7d={topGainer.pct7d}
            />
          )}
        </div>
      </div>

      <div style={{ marginTop: 15 }}>
        <AssetsTable assets={assets} livePrices={livePrices} />
      </div>
    </div>
  );
}
