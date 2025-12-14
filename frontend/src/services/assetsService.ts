/* =========================================
   Types (UI contracts)
========================================= */

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

export type AssetsGlobalData = {
  totalMarketCapUsd: number;
  btcDominance: number;
  ethDominance: number;
};

export type AssetsDataSnapshot = {
  assets: AssetRow[];
  global: AssetsGlobalData;
};

/* =========================================
   CoinGecko raw types
========================================= */

type CoinGeckoMarketCoin = {
  symbol: string;
  current_price: number;
  market_cap: number;
  total_volume: number;

  price_change_percentage_1h_in_currency?: number | null;
  price_change_percentage_24h_in_currency?: number | null;
  price_change_percentage_7d_in_currency?: number | null;

  sparkline_in_7d?: {
    price?: number[];
  };
};

type CoinGeckoGlobal = {
  data: {
    total_market_cap: {
      usd: number;
    };
    market_cap_percentage: {
      btc: number;
      eth: number;
    };
  };
};

/* =========================================
   Config
========================================= */

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

const CACHE_KEY_MARKETS = "assets.cache.markets";
const CACHE_KEY_GLOBAL = "assets.cache.global";
const CACHE_KEY_FETCHED_AT = "assets.cache.fetchedAt";

const ONE_HOUR = 60 * 60 * 1000;

/* =========================================
   Utils
========================================= */

function now(): number {
  return Date.now();
}

function isFresh(ts: number): boolean {
  return now() - ts < ONE_HOUR;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/* =========================================
   Fetchers
========================================= */

async function fetchMarkets(): Promise<CoinGeckoMarketCoin[]> {
  const url = new URL(`${COINGECKO_BASE}/coins/markets`);
  url.searchParams.set("vs_currency", "usd");
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", "50");
  url.searchParams.set("page", "1");
  url.searchParams.set("sparkline", "true");
  url.searchParams.set("price_change_percentage", "1h,24h,7d");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Failed to fetch CoinGecko markets");
  }

  return res.json();
}

async function fetchGlobal(): Promise<CoinGeckoGlobal> {
  const res = await fetch(`${COINGECKO_BASE}/global`);
  if (!res.ok) {
    throw new Error("Failed to fetch CoinGecko global data");
  }

  return res.json();
}

/* =========================================
   Normalization
========================================= */

function normalizeAssets(data: CoinGeckoMarketCoin[]): AssetRow[] {
  return data.map((c) => ({
    symbol: c.symbol.toUpperCase(),
    price: c.current_price ?? 0,

    change1hPct: c.price_change_percentage_1h_in_currency ?? 0,
    change24hPct: c.price_change_percentage_24h_in_currency ?? 0,
    change7dPct: c.price_change_percentage_7d_in_currency ?? 0,

    marketCapUsd: c.market_cap ?? 0,
    volume24hUsd: c.total_volume ?? 0,

    sparkline: c.sparkline_in_7d?.price ?? [],
  }));
}

function normalizeGlobal(data: CoinGeckoGlobal): AssetsGlobalData {
  return {
    totalMarketCapUsd: data.data.total_market_cap.usd,
    btcDominance: data.data.market_cap_percentage.btc,
    ethDominance: data.data.market_cap_percentage.eth,
  };
}

/* =========================================
   Cache helpers
========================================= */

function readCache(): AssetsDataSnapshot | null {
  const marketsRaw = localStorage.getItem(CACHE_KEY_MARKETS);
  const globalRaw = localStorage.getItem(CACHE_KEY_GLOBAL);
  const fetchedAtRaw = localStorage.getItem(CACHE_KEY_FETCHED_AT);

  const markets = safeParse<CoinGeckoMarketCoin[]>(marketsRaw);
  const global = safeParse<CoinGeckoGlobal>(globalRaw);
  const fetchedAt = fetchedAtRaw ? Number(fetchedAtRaw) : null;

  if (!markets || !global || !fetchedAt) return null;

  return {
    assets: normalizeAssets(markets),
    global: normalizeGlobal(global),
  };
}

function writeCache(
  markets: CoinGeckoMarketCoin[],
  global: CoinGeckoGlobal
) {
  localStorage.setItem(CACHE_KEY_MARKETS, JSON.stringify(markets));
  localStorage.setItem(CACHE_KEY_GLOBAL, JSON.stringify(global));
  localStorage.setItem(CACHE_KEY_FETCHED_AT, String(now()));
}

/* =========================================
   Public API
========================================= */

export async function getAssetsData(): Promise<AssetsDataSnapshot> {
  const cachedMarkets = localStorage.getItem(CACHE_KEY_MARKETS);
  const cachedGlobal = localStorage.getItem(CACHE_KEY_GLOBAL);
  const fetchedAt = Number(localStorage.getItem(CACHE_KEY_FETCHED_AT) || 0);

  const hasCache = Boolean(cachedMarkets && cachedGlobal && fetchedAt);

  // 1️⃣ Если есть кеш → сразу отдаём
  if (hasCache) {
    const snapshot = readCache();
    if (snapshot) {
      // lazy refresh
      if (!isFresh(fetchedAt)) {
        void refreshInBackground();
      }
      return snapshot;
    }
  }

  // 2️⃣ Кеша нет → блокирующий fetch
  const [markets, global] = await Promise.all([
    fetchMarkets(),
    fetchGlobal(),
  ]);

  writeCache(markets, global);

  return {
    assets: normalizeAssets(markets),
    global: normalizeGlobal(global),
  };
}

/* =========================================
   Background refresh
========================================= */

async function refreshInBackground() {
  try {
    const [markets, global] = await Promise.all([
      fetchMarkets(),
      fetchGlobal(),
    ]);
    writeCache(markets, global);
  } catch {
    // молча оставляем старый кеш
  }
}
