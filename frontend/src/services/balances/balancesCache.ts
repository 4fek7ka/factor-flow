import type { BalanceAsset } from "./types";

const KEY_DATA = "balances.eth.v1";
const KEY_TS = "balances.eth.fetchedAt";

const TTL = 10 * 60 * 1000; // 10 min

type StoredBalances = {
  chain: "eth";
  wallet: string;
  assets: BalanceAsset[];
};

export function saveBalancesEth(
  wallet: string,
  assets: BalanceAsset[]
) {
  const payload: StoredBalances = {
    chain: "eth",
    wallet,
    assets,
  };

  localStorage.setItem(KEY_DATA, JSON.stringify(payload));
  localStorage.setItem(KEY_TS, String(Date.now()));
}

export function readBalancesEth(): StoredBalances | null {
  const raw = localStorage.getItem(KEY_DATA);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredBalances;
  } catch {
    return null;
  }
}

export function isBalancesEthFresh(): boolean {
  const ts = Number(localStorage.getItem(KEY_TS) || 0);
  return Date.now() - ts < TTL;
}
