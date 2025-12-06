import { Router } from "express";
import { generateNextPrice } from "../generators/priceGenerator";

const router = Router();

router.get("/price/:asset", (req, res) => {
  const { asset } = req.params;

  // временная цена
  const basePrice = 1000;

  const nextPrice = generateNextPrice(basePrice);

  res.json({
    asset,
    price: nextPrice
  });
});

export default router;
