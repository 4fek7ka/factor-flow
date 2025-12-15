/* =========================
   CoinGecko API
========================= */

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export type CoinGeckoMarket = {
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

export type CoinGeckoGlobal = {
  data: {
    total_market_cap: { usd: number };
    market_cap_change_percentage_24h_usd: number;
    market_cap_percentage: {
      btc: number;
      eth: number;
    };
  };
};

export async function fetchMarkets(): Promise<CoinGeckoMarket[]> {
  const url =
    `${COINGECKO_BASE}/coins/markets` +
    `?vs_currency=usd` +
    `&order=market_cap_desc` +
    `&per_page=100` +
    `&page=1` +
    `&sparkline=true` +
    `&price_change_percentage=1h,24h,7d`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("CoinGecko markets failed");

  return res.json();
}

export async function fetchGlobal(): Promise<CoinGeckoGlobal> {
  const res = await fetch(`${COINGECKO_BASE}/global`);
  if (!res.ok) throw new Error("CoinGecko global failed");

  return res.json();
}

/* =========================
   Fear & Greed
========================= */

type FearGreedApiResponse = {
  data: Array<{
    value: string;
    value_classification: string;
    timestamp: string;
  }>;
};

export async function fetchFearGreed(): Promise<number | null> {
  const res = await fetch("https://api.alternative.me/fng/");
  if (!res.ok) return null;

  const json = (await res.json()) as FearGreedApiResponse;
  const value = Number(json.data[0]?.value);

  return Number.isNaN(value) ? null : value;
}
