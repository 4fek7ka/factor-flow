export type BalanceAsset = {
  source: "moralis";

  symbol: string;
  name: string;
  decimals: number;

  balanceRaw: string;
  balance: number;

  tokenAddress?: string;
  isNative: boolean;
};
