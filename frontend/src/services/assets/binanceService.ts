export type BinancePriceMap = Record<string, number>;

const BINANCE_BASE = "https://api.binance.com";

// ⛔ ЭКСПЕРИМЕНТАЛЬНО: строго 10 активов
const SYMBOLS = [
  "BTC",
  "ETH",
  "BNB",
  "SOL",
  "XRP",
  "DOGE",
  "ADA",
  "LTC",
  "AVAX",
  "LINK",
];

let lastFetchAt: number | null = null;

export async function fetchBinancePrices(): Promise<BinancePriceMap> {
  const pairs = SYMBOLS.map((s) => `${s}USDT`);

  const now = Date.now();
  if (lastFetchAt) {
    const diff = ((now - lastFetchAt) / 1000).toFixed(1);
    console.log(`[Binance] fetch after ${diff}s`);
  } else {
    console.log("[Binance] first fetch");
  }
  lastFetchAt = now;

  console.log("[Binance] requesting:", pairs.join(", "));

  const url =
    `${BINANCE_BASE}/api/v3/ticker/price?symbols=` +
    encodeURIComponent(JSON.stringify(pairs));

  const res = await fetch(url);

  if (!res.ok) {
    console.log("[Binance] HTTP error", res.status);
    throw new Error("Binance request failed");
  }

  const data = (await res.json()) as Array<{ symbol: string; price: string }>;

  const out: BinancePriceMap = {};

  for (const row of data) {
    if (row.symbol.endsWith("USDT")) {
      const base = row.symbol.replace("USDT", "");
      out[base] = Number(row.price);
    }
  }

  const summary = Object.entries(out)
    .map(([k, v]) => `${k} ${v}`)
    .join(" | ");

  console.log("[Binance] response:", summary || "EMPTY");

  return out;
}
