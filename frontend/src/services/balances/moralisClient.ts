const MORALIS_BASE = "https://deep-index.moralis.io/api/v2";

/**
 * ⚠️ TEMP HARDCODE
 * Только для MVP / локальной разработки
 * Потом убрать в .env или backend
 */
const MORALIS_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjM1ZDc2OTRmLTBmOWUtNDM4Yy1iNTBmLTRmNmE4YTEyZGY0YiIsIm9yZ0lkIjoiNDg2Mjg2IiwidXNlcklkIjoiNTAwMjkxIiwidHlwZUlkIjoiYzM3MzRjOGMtMzUzNC00MDI4LTlmNzEtOGRlOGRiM2Q4MmYwIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NjU4NTM5MzMsImV4cCI6NDkyMTYxMzkzM30.wQ9VlqQKyg6v5f7wU85HEozh1el1pUwnvSXkf3FS-Gk";

type FetchOptions = {
  path: string;
  params?: Record<string, string | number | boolean | undefined>;
};

async function moralisFetch<T>({ path, params }: FetchOptions): Promise<T> {
  const url = new URL(`${MORALIS_BASE}${path}`);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }

  const res = await fetch(url.toString(), {
    headers: {
      "X-API-Key": MORALIS_API_KEY,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[Moralis] ${res.status}: ${text}`);
  }

  return res.json();
}

/* =========================
   ETH MAINNET
========================= */

export function fetchEthNativeBalance(address: string) {
  return moralisFetch<{
    balance: string;
  }>({
    path: `/${address}/balance`,
    params: { chain: "eth" },
  });
}

export function fetchEthTokenBalances(address: string) {
  return moralisFetch<
    Array<{
      token_address: string;
      symbol: string;
      name: string;
      decimals: number;
      balance: string;
    }>
  >({
    path: `/${address}/erc20`,
    params: { chain: "eth" },
  });
}
