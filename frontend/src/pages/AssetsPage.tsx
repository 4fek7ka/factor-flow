import { useEffect, useMemo, useState } from "react";

import {
  fetchMarkets,
  fetchGlobal,
  fetchFearGreed,
} from "../services/assetsApi";

import {
  saveMarkets,
  readMarkets,
  isMarketsFresh,
  saveGlobal,
  readGlobal,
  saveFearGreed,
  readFearGreed,
} from "../services/assetsCache";

import {
  buildAssetsTable,
  getDominance,
  getGlobalMarketCapSnapshot,
  getTopGainer7d,
  type AssetRow,
} from "../services/assetsSelectors";

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

  const [dominance, setDominance] = useState<{
    btc: number;
    eth: number;
    alt: number;
  } | null>(null);

  const [topGainer, setTopGainer] = useState<{
    name: string;
    symbol: string;
    image?: string;
    pct7d: number;
  } | null>(null);

  /* ===== BASE DATA (CoinGecko → cache → selectors) ===== */
  useEffect(() => {
    async function load() {
      if (!isMarketsFresh()) {
        const [markets, global, fear] = await Promise.all([
          fetchMarkets(),
          fetchGlobal(),
          fetchFearGreed(),
        ]);

        saveMarkets(markets);
        saveGlobal(global);
        if (fear !== null) saveFearGreed(fear);
      }

      const markets = readMarkets() ?? [];
      const global = readGlobal();
      const fear = readFearGreed();

      setAssets(buildAssetsTable(markets));
      setFearGreed(fear);

      if (global) {
        const snap = getGlobalMarketCapSnapshot(global);
        setMarketCap({
          capUsd: snap.capUsd,
          changePct24h: snap.changePct24h,
          sparkline: markets[0]?.sparkline_in_7d?.price ?? [],
        });

        setDominance(getDominance(global));
      }

      setTopGainer(getTopGainer7d(markets));
    }

    load().catch(console.error);
  }, []);

  /* ===== LIVE PRICES (Binance) ===== */
  const visibleSymbols = useMemo(
    () => assets.map((a) => a.symbol),
    [assets]
  );

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
