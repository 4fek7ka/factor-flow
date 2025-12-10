// src/services/assetsService.ts
import type { HistoryPoint } from "./portfolioService";

export type AssetRow = {
  symbol: string;
  price: number;
  change24hPct: number;
  sparkline: number[];
};

const ASSET_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  WBTC: "Wrapped BTC",
  ETH: "Ethereum",
  SOL: "Solana",
  TON: "Toncoin",
  USDC: "USD Coin",
  USDT: "Tether",
  DAI: "Dai",
  UNI: "Uniswap",
  DOGE: "Dogecoin",
  SHIB: "Shiba Inu",
};

/**
 * Возвращает список активов с:
 * - price (текущая цена)
 * - change24hPct (изменение за 24h)
 * - sparkline (24h мини-график)
 */
export function buildAssetsTable(history: HistoryPoint[]): AssetRow[] {
  if (!history.length) return [];

  const lastPoint = history[history.length - 1];
  const lastPrices = lastPoint.prices;

  // Вычисляем отметку "24 часа назад"
  const lastTs = lastPoint.timestamp;
  const cutoff = lastTs - 24 * 3600;

  // Фильтруем историю за 24 часа
  const last24h = history.filter((p) => p.timestamp >= cutoff);
  const first24h = last24h[0] ?? history[0];

  const firstPrices = first24h.prices;

  const symbols = Object.keys(lastPrices);

  const rows: AssetRow[] = symbols.map((symbol) => {
    const priceNow = lastPrices[symbol as keyof typeof lastPrices];
    const price24h = firstPrices[symbol as keyof typeof firstPrices];

    const changePct =
      price24h && price24h > 0
        ? ((priceNow - price24h) / price24h) * 100
        : 0;

    // Sparkline: нормализуем в %, чтобы ось была одинаковой
    const spark = last24h.map((p) => {
      const v = p.prices[symbol as keyof typeof p.prices];
      return v;
    });

    return {
      symbol,
      price: priceNow,
      change24hPct: changePct,
      sparkline: spark,
    };
  });

  // сортируем по капу (пока по цене — как суррогат)
  return rows.sort((a, b) => b.price - a.price);
}
