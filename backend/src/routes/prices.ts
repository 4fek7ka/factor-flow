import { Router } from "express";
import { generateNextPrice } from "../generators/priceGenerator";
import { readPrices, writePrices, PriceHistoryMap } from "../data/storage";

const router = Router();

router.get("/price/:asset", (req, res) => {
  const { asset } = req.params;

  const prices: PriceHistoryMap = readPrices();
  const history = prices[asset];

  if (!history) {
    return res.status(404).json({ error: "Unknown asset" });
  }

  const currentPrice = history[history.length - 1];
  const nextPrice = generateNextPrice(currentPrice);

  history.push(nextPrice);

  writePrices(prices);

  res.json({
    asset,
    history
  });
});

export default router;
