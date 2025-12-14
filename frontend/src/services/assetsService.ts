import type { HistoryPoint } from "./portfolioService";

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

/* ---------------------------------- */
/* CoinGecko helpers */
/* ---------------------------------- */

type CoinGeckoMarketCoin = {
  symbol: string;
  current_price: number;
  market_cap: number;
  total_volume: number;

  price_change_percentage_1h_in_currency?: number | null;
  price_change_percentage_24h_in_currency?: number | null;
  price_change_percentage_7d_in_currency?: number | null;

  sparkline_in_7d?: { price?: number[] };
};

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

async function fetchFromCoinGecko(): Promise<AssetRow[]> {
  const url = new URL(`${COINGECKO_BASE}/coins/markets`);
  url.searchParams.set("vs_currency", "usd");
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", "50");
  url.searchParams.set("page", "1");
  url.searchParams.set("sparkline", "true");
  url.searchParams.set("price_change_percentage", "1h,24h,7d");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Failed to fetch assets from CoinGecko");
  }

  const data = (await res.json()) as CoinGeckoMarketCoin[];

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

/* ---------------------------------- */
/* PUBLIC API */
/* ---------------------------------- */

/**
 * Формирует таблицу активов.
 *
 * - history !== null → старый MVP (mock-history)
 * - history === null → реальные данные CoinGecko
 */
export async function buildAssetsTable(
  history: HistoryPoint[] | null
): Promise<AssetRow[]> {
  if (!history) {
    return fetchFromCoinGecko();
  }

  /* ---------- СТАРЫЙ MVP-КОД (без изменений) ---------- */

  if (!history.length) return [];

  const lastPoint = history[history.length - 1];
  const lastPrices = lastPoint.prices;

  const lastTs = lastPoint.timestamp;
  const cutoff24 = lastTs - 24 * 3600;

  const last24h = history.filter((p) => p.timestamp >= cutoff24);
  const first24h = last24h[0] ?? history[0];
  const firstPrices = first24h.prices;

  const symbols = Object.keys(lastPrices);

  const rows: AssetRow[] = symbols.map((symbol) => {
    const priceNow = lastPrices[symbol as keyof typeof lastPrices];
    const price24h = firstPrices[symbol as keyof typeof firstPrices];

    const change24 =
      price24h && price24h > 0 ? ((priceNow - price24h) / price24h) * 100 : 0;

    const change1h = (Math.random() - 0.5) * 2;
    const change7d = (Math.random() - 0.5) * 20;

    const marketCap = 1_000_000_000 + Math.random() * 300_000_000_000;
    const volume24h = 10_000_000 + Math.random() * 20_000_000_000;

    const spark = last24h.map((p) => {
      const v = p.prices[symbol as keyof typeof p.prices];
      return v;
    });

    return {
      symbol,
      price: priceNow,
      change1hPct: change1h,
      change24hPct: change24,
      change7dPct: change7d,
      marketCapUsd: marketCap,
      volume24hUsd: volume24h,
      sparkline: spark,
    };
  });

  return rows.sort((a, b) => b.price - a.price);
}
