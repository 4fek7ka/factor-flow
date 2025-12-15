import type { CoinGeckoMarket, CoinGeckoGlobal } from "./assetsApi";

/* =========================
   UI types
========================= */

export type AssetRow = {
  symbol: string;
  iconUrl: string | null;

  price: number;

  change1hPct: number;
  change24hPct: number;
  change7dPct: number;

  marketCapUsd: number;
  volume24hUsd: number;

  sparkline: number[];
};

/* =========================
   Table
========================= */

export function buildAssetsTable(markets: CoinGeckoMarket[]): AssetRow[] {
  return markets.map((m) => ({
    symbol: m.symbol.toUpperCase(),
    iconUrl: m.image ?? null,

    price: m.current_price,
    change1hPct: m.price_change_percentage_1h_in_currency ?? 0,
    change24hPct: m.price_change_percentage_24h_in_currency ?? 0,
    change7dPct: m.price_change_percentage_7d_in_currency ?? 0,

    marketCapUsd: m.market_cap,
    volume24hUsd: m.total_volume,

    sparkline: m.sparkline_in_7d?.price ?? [],
  }));
}

/* =========================
   Global metrics
========================= */

export function getGlobalMarketCapSnapshot(global: CoinGeckoGlobal) {
  return {
    capUsd: global.data.total_market_cap.usd,
    changePct24h: global.data.market_cap_change_percentage_24h_usd,
  };
}

export function getDominance(global: CoinGeckoGlobal) {
  const btc = global.data.market_cap_percentage.btc ?? 0;
  const eth = global.data.market_cap_percentage.eth ?? 0;

  return {
    btc,
    eth,
    alt: Math.max(0, 100 - btc - eth),
  };
}

/* =========================
   Top Gainer
========================= */

export function getTopGainer7d(markets: CoinGeckoMarket[]) {
  if (markets.length === 0) return null;

  const top30 = [...markets]
    .sort((a, b) => b.market_cap - a.market_cap)
    .slice(0, 30);

  const best = top30.reduce((a, b) =>
    (b.price_change_percentage_7d_in_currency ?? -Infinity) >
    (a.price_change_percentage_7d_in_currency ?? -Infinity)
      ? b
      : a
  );

  return {
    name: best.name,
    symbol: best.symbol,
    image: best.image,
    pct7d: best.price_change_percentage_7d_in_currency ?? 0,
  };
}
