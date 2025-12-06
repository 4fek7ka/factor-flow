import { Router } from "express";
import { generateNextPrice } from "../generators/priceGenerator";
import { readPrices, writePrices } from "../data/storage";

const router = Router();

router.get("/price/:asset", (req, res) => {
  const { asset } = req.params;

  const prices = readPrices();
  const currentPrice = prices[asset];

  if (!currentPrice) {
    return res.status(404).json({ error: "Unknown asset" });
  }

  const nextPrice = generateNextPrice(currentPrice);
  prices[asset] = nextPrice;

  writePrices(prices);

  res.json({
    asset,
    price: nextPrice
  });
});

export default router;
