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

/**
 * Формирует таблицу активов:
 * - price
 * - 1h%, 24h%, 7d% (фиктивные для MVP)
 * - market cap, volume24h (фиктивные)
 * - sparkline (реальный из истории)
 */
export function buildAssetsTable(history: HistoryPoint[]): AssetRow[] {
  if (!history.length) return [];

  const lastPoint = history[history.length - 1];
  const lastPrices = lastPoint.prices;

  // 24h cutoff
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

    // 1h & 7d пока делаем фиктивно
    const change1h = (Math.random() - 0.5) * 2;   // -1..+1%
    const change7d = (Math.random() - 0.5) * 20;  // -10..+10%

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

  // сортировка по цене (как суррогат капитализации)
  return rows.sort((a, b) => b.price - a.price);
}
