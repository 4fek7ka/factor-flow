import { useEffect, useMemo, useState } from "react";

import type {
  AssetRow,
  AssetsGlobalData,
} from "../services/assetsService";
import { getAssetsData } from "../services/assetsService";

import { AssetsTable } from "../components/assets/AssetsTable";
import { MarketCapCard } from "../components/assets/MarketCapCard";
import { FearGreedCard } from "../components/assets/FearGreedCard";
import { BtcEthAltCard } from "../components/assets/BtcEthAltCard";
import { TopGainer7dCard } from "../components/assets/TopGainer7dCard";

export function AssetsPage() {
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [global, setGlobal] = useState<AssetsGlobalData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const snapshot = await getAssetsData();
        if (cancelled) return;

        setAssets(snapshot.assets);
        setGlobal(snapshot.global);
      } catch (e) {
        if (cancelled) return;
        setError((e as Error)?.message || "Failed to load assets");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* -------------------------------------------------
     Верхние карточки
     (MarketCap + Dominance — уже из real data,
      Fear & Greed — пока mock)
  -------------------------------------------------- */

  const marketCapUsd = global?.totalMarketCapUsd ?? 0;
  const btcDom = global?.btcDominance ?? 0;
  const ethDom = global?.ethDominance ?? 0;
  const altDom = 100 - btcDom - ethDom;

  const fakeChangePct = 0;
  const fakeSpark: number[] = [];
  const fakeFearIndex = 30;

  const topGainer = useMemo(() => {
    if (!assets.length) return null;

    return assets.reduce((best, a) =>
      a.change7dPct > best.change7dPct ? a : best
    );
  }, [assets]);

  const table = useMemo(() => {
    if (loading) {
      return <div className="text-muted p-3">Loading assets…</div>;
    }
    if (error) {
      return <div className="text-danger p-3">{error}</div>;
    }
    return <AssetsTable assets={assets} />;
  }, [assets, loading, error]);

  return (
    <div>
      <div className="row row-cards mb-2">
        <div className="col-12 col-md-6 col-lg-3 d-flex">
          <MarketCapCard
            capUsd={marketCapUsd}
            changePct={fakeChangePct}
            spark={fakeSpark}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-3 d-flex">
          <FearGreedCard value={fakeFearIndex} />
        </div>

        <div className="col-12 col-md-6 col-lg-3 d-flex">
          <BtcEthAltCard btc={btcDom} eth={ethDom} alt={altDom} />
        </div>

        <div className="col-12 col-md-6 col-lg-3 d-flex">
          {topGainer && (
            <TopGainer7dCard
              name={topGainer.symbol}
              symbol={topGainer.symbol}
              image=""
              pct7d={topGainer.change7dPct}
            />
          )}
        </div>
      </div>

      <div style={{ marginTop: 15 }}>{table}</div>
    </div>
  );
}
