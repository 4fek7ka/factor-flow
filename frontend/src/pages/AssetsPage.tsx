import { useEffect, useMemo, useState } from "react";

import {
  fetchMarkets,
  fetchGlobal,
  fetchFearGreed,
} from "../services//assets/assetsApi";

import {
  saveMarkets,
  readMarkets,
  isMarketsFresh,
  saveGlobal,
  readGlobal,
  saveFearGreed,
  readFearGreed,
} from "../services/assets/assetsCache";

import {
  buildAssetsTable,
  getDominance,
  getGlobalMarketCapSnapshot,
  getTopGainer7d,
  type AssetRow,
} from "../services/assets/assetsSelectors";

import { fetchBinancePrices } from "../services/assets/binanceService";

import { AssetsTable } from "../components/assets/AssetsTable";
import { MarketCapCard } from "../components/assets/MarketCapCard";
import { FearGreedCard } from "../components/assets/FearGreedCard";
import { BtcEthAltCard } from "../components/assets/BtcEthAltCard";
import { TopGainer7dCard } from "../components/assets/TopGainer7dCard";

const PAGE_SIZE = 20;

export function AssetsPage() {
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);

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

  /* ===== BASE DATA ===== */
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

  /* ===== PAGINATION ===== */
  const totalPages = Math.max(1, Math.ceil(assets.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedAssets = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return assets.slice(start, start + PAGE_SIZE);
  }, [assets, page]);

  /* ===== LIVE PRICES ===== */
  const visibleSymbols = useMemo(
    () => pagedAssets.map((a) => a.symbol),
    [pagedAssets]
  );

  useEffect(() => {
    if (!visibleSymbols.length) return;

    let active = true;

    async function tick() {
      try {
        const prices = await fetchBinancePrices();
        if (active) setLivePrices(prices);
      } catch {}
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
        <AssetsTable assets={pagedAssets} livePrices={livePrices} />
      </div>

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 16,
          gap: 8,
        }}
      >
        <button
          className="btn btn-sm"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const p = i + 1;
          const active = p === page;

          return (
            <button
              key={p}
              className={`btn btn-sm ${active ? "btn-primary" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          );
        })}

        <button
          className="btn btn-sm"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
