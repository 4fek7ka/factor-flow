import {
  fetchEthNativeBalance,
  fetchEthTokenBalances,
} from "./moralisClient";
import type { BalanceAsset } from "./types";

function toNumber(raw: string, decimals: number): number {
  if (!raw) return 0;
  return Number(raw) / 10 ** decimals;
}

function isValidAsset(a: BalanceAsset): boolean {
  if (!a.symbol) return false;
  if (!Number.isFinite(a.balance)) return false;
  if (a.balance <= 0) return false;
  if (a.decimals < 0 || a.decimals > 36) return false;
  return true;
}

export async function fetchBalancesEth(
  wallet: string
): Promise<BalanceAsset[]> {
  const [native, tokens] = await Promise.all([
    fetchEthNativeBalance(wallet),
    fetchEthTokenBalances(wallet),
  ]);

  const out: BalanceAsset[] = [];

  // ETH native
  {
    const decimals = 18;
    const balance = toNumber(native.balance, decimals);

    const eth: BalanceAsset = {
      source: "moralis",
      symbol: "ETH",
      name: "Ethereum",
      decimals,
      balanceRaw: native.balance,
      balance,
      isNative: true,
    };

    if (isValidAsset(eth)) out.push(eth);
  }

  // ERC-20 tokens
  for (const t of tokens) {
    const balance = toNumber(t.balance, t.decimals);

    const asset: BalanceAsset = {
      source: "moralis",
      symbol: t.symbol,
      name: t.name,
      decimals: t.decimals,
      balanceRaw: t.balance,
      balance,
      tokenAddress: t.token_address,
      isNative: false,
    };

    if (isValidAsset(asset)) out.push(asset);
  }

  return out;
}
