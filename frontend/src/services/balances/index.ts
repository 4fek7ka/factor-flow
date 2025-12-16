import { fetchBalancesEth } from "./balancesService";
import {
  saveBalancesEth,
  readBalancesEth,
  isBalancesEthFresh,
} from "./balancesCache";

export async function getBalancesEth(wallet: string) {
  if (isBalancesEthFresh()) {
    const cached = readBalancesEth();
    if (cached && cached.wallet === wallet) {
      return cached.assets;
    }
  }

  const assets = await fetchBalancesEth(wallet);
  saveBalancesEth(wallet, assets);
  return assets;
}
