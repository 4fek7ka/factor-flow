import { useEffect, useMemo, useState } from "react";

import type { AssetRow } from "../services/assetsService";
import {
  getAssetsTableFromCache,
  getGlobalMarketCap,
  getDominance,
  getTopGainer7d,
} from "../services/assetsService";

import { AssetsTable } from "../components/assets/AssetsTable";
import { MarketCapCard } from "../components/assets/MarketCapCard";
import { FearGreedCard } from "../components/assets/FearGreedCard";
import { BtcEthAltCard } from "../components/assets/BtcEthAltCard";
import { TopGainer7dCard } from "../components/assets/TopGainer7dCard";

export function AssetsPage() {
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);

      const rows = getAssetsTableFromCache();
      setAssets(rows);
    } catch (e) {
      setError((e as Error)?.message || "Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===== GLOBAL DATA (FROM CACHE) ===== */

  const marketCap = getGlobalMarketCap();
  const dominance = getDominance();
  const topGainer = getTopGainer7d();

  const table = useMemo(() => {
    if (loading) return <div className="text-muted p-3">Loading assets…</div>;
    if (error) return <div className="text-danger p-3">{error}</div>;
    return <AssetsTable assets={assets} />;
  }, [assets, loading, error]);

  return (
    <div>
      <div className="row row-cards mb-2">
        <div className="col-12 col-md-6 col-lg-3 d-flex">
          {marketCap && (
            <MarketCapCard
              capUsd={marketCap.capUsd}
              changePct={marketCap.changePct24h}
              spark={[]}
            />
          )}
        </div>

        <div className="col-12 col-md-6 col-lg-3 d-flex">
          <FearGreedCard value={30} />
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

      <div style={{ marginTop: 15 }}>{table}</div>
    </div>
  );
}
