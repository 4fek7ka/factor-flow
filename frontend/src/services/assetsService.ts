export type AssetRow = {
  symbol: string;
  price: number;

  change1hPct: number;
  change24hPct: number;
  change7dPct: number;

  marketCapUsd: number;
  volume24hUsd: number;

  sparkline: number[];
};

type CoinGeckoMarket = {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: { price: number[] };
};

type CoinGeckoGlobal = {
  data: {
    total_market_cap: { usd: number };
    market_cap_change_percentage_24h_usd: number;
    market_cap_percentage: {
      btc: number;
      eth: number;
      [k: string]: number;
    };
  };
};

const MARKETS_KEY = "assets.cache.markets";
const GLOBAL_KEY = "assets.cache.global";

/* =========================
   CACHE READERS
========================= */

function readMarkets(): CoinGeckoMarket[] | null {
  const raw = localStorage.getItem(MARKETS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readGlobal(): CoinGeckoGlobal | null {
  const raw = localStorage.getItem(GLOBAL_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* =========================
   PUBLIC API
========================= */

export function getAssetsTableFromCache(): AssetRow[] {
  const markets = readMarkets();
  if (!markets) return [];

  return markets.map((m) => ({
    symbol: m.symbol.toUpperCase(),
    price: m.current_price,

    change1hPct: m.price_change_percentage_1h_in_currency ?? 0,
    change24hPct: m.price_change_percentage_24h_in_currency ?? 0,
    change7dPct: m.price_change_percentage_7d_in_currency ?? 0,

    marketCapUsd: m.market_cap,
    volume24hUsd: m.total_volume,

    sparkline: m.sparkline_in_7d?.price ?? [],
  }));
}

export function getGlobalMarketCap() {
  const g = readGlobal();
  if (!g) return null;

  return {
    capUsd: g.data.total_market_cap.usd,
    changePct24h: g.data.market_cap_change_percentage_24h_usd,
  };
}

export function getDominance() {
  const g = readGlobal();
  if (!g) return null;

  const btc = g.data.market_cap_percentage.btc ?? 0;
  const eth = g.data.market_cap_percentage.eth ?? 0;

  return {
    btc,
    eth,
    alt: Math.max(0, 100 - btc - eth),
  };
}

export function getTopGainer7d() {
  const markets = readMarkets();
  if (!markets || markets.length === 0) return null;

  const best = markets.reduce((a, b) => {
    const av = a.price_change_percentage_7d_in_currency ?? -Infinity;
    const bv = b.price_change_percentage_7d_in_currency ?? -Infinity;
    return bv > av ? b : a;
  });

  return {
    name: best.name,
    symbol: best.symbol,
    image: best.image,
    pct7d: best.price_change_percentage_7d_in_currency ?? 0,
  };
}
