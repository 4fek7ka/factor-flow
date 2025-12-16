import type { CoinGeckoMarket, CoinGeckoGlobal } from "./assetsApi";

/* =========================
   Cache keys
========================= */

const MARKETS_KEY = "assets.cache.markets";
const GLOBAL_KEY = "assets.cache.global";

const FEAR_GREED_KEY = "assets.cache.fearGreed";
const FEAR_GREED_TS_KEY = "assets.cache.fearGreed.fetchedAt";

const FETCHED_AT_KEY = "assets.cache.fetchedAt";

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
   Markets
========================= */

export function saveMarkets(markets: CoinGeckoMarket[]) {
  localStorage.setItem(MARKETS_KEY, JSON.stringify(markets));
  localStorage.setItem(FETCHED_AT_KEY, String(Date.now()));
}

export function readMarkets(): CoinGeckoMarket[] | null {
  return readJSON<CoinGeckoMarket[]>(MARKETS_KEY);
}

export function isMarketsFresh(): boolean {
  const ts = Number(localStorage.getItem(FETCHED_AT_KEY) || 0);
  return Date.now() - ts < ONE_HOUR;
}

/* =========================
   Global
========================= */

export function saveGlobal(global: CoinGeckoGlobal) {
  localStorage.setItem(GLOBAL_KEY, JSON.stringify(global));
}

export function readGlobal(): CoinGeckoGlobal | null {
  return readJSON<CoinGeckoGlobal>(GLOBAL_KEY);
}

/* =========================
   Fear & Greed
========================= */

export function saveFearGreed(value: number) {
  localStorage.setItem(FEAR_GREED_KEY, String(value));
  localStorage.setItem(FEAR_GREED_TS_KEY, String(Date.now()));
}

export function readFearGreed(): number | null {
  const ts = Number(localStorage.getItem(FEAR_GREED_TS_KEY) || 0);
  const fresh = Date.now() - ts < ONE_HOUR;

  const v = Number(localStorage.getItem(FEAR_GREED_KEY));
  if (Number.isNaN(v)) return null;

  return fresh ? v : null;
}
