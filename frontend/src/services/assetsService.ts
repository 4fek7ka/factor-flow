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

/* =========================
   CoinGecko types
========================= */

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
    };
  };
};

/* =========================
   Cache keys
========================= */

const MARKETS_KEY = "assets.cache.markets";
const GLOBAL_KEY = "assets.cache.global";

const BTC_HISTORY_KEY = "assets.cache.btcMarketCapHistory";
const BTC_HISTORY_TS_KEY = "assets.cache.btcMarketCapHistory.fetchedAt";

const ONE_HOUR = 60 * 60 * 1000;

/* =========================
   Helpers
========================= */

function readJSON<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* =========================
   Assets table
========================= */

export function getAssetsTableFromCache(): AssetRow[] {
  const markets = readJSON<CoinGeckoMarket[]>(MARKETS_KEY);
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

/* =========================
   Global snapshot
========================= */

export function getGlobalMarketCapSnapshot() {
  const g = readJSON<CoinGeckoGlobal>(GLOBAL_KEY);
  if (!g) return null;

  return {
    capUsd: g.data.total_market_cap.usd,
    changePct24h: g.data.market_cap_change_percentage_24h_usd,
  };
}

export function getDominance() {
  const g = readJSON<CoinGeckoGlobal>(GLOBAL_KEY);
  if (!g) return null;

  const btc = g.data.market_cap_percentage.btc ?? 0;
  const eth = g.data.market_cap_percentage.eth ?? 0;

  return {
    btc,
    eth,
    alt: Math.max(0, 100 - btc - eth),
  };
}

/* =========================
   Top gainer
========================= */

export function getTopGainer7d() {
  const markets = readJSON<CoinGeckoMarket[]>(MARKETS_KEY);
  if (!markets || markets.length === 0) return null;

  const best = markets.reduce((a, b) =>
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

/* =========================
   BTC surrogate history
========================= */

export async function getGlobalMarketCapWithBtcSurrogate(): Promise<{
  capUsd: number;
  changePct24h: number;
  sparkline: number[];
} | null> {
  const snapshot = getGlobalMarketCapSnapshot();
  if (!snapshot) return null;

  const ts = Number(localStorage.getItem(BTC_HISTORY_TS_KEY) || 0);
  const cached = readJSON<number[]>(BTC_HISTORY_KEY);
  const fresh = Date.now() - ts < ONE_HOUR;

  if (cached && fresh) {
    return { ...snapshot, sparkline: cached };
  }

  // lazy background update
  fetchBtcMarketCapHistory().catch(() => {});

  return { ...snapshot, sparkline: cached ?? [] };
}

async function fetchBtcMarketCapHistory() {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7"
  );
  const json = await res.json();

  const series: number[] = json.market_caps.map(
    ([, value]: [number, number]) => value
  );

  localStorage.setItem(BTC_HISTORY_KEY, JSON.stringify(series));
  localStorage.setItem(BTC_HISTORY_TS_KEY, String(Date.now()));
}
