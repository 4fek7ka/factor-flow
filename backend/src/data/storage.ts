import fs from "fs";
import path from "path";

const filePath = path.join(__dirname, "prices.json");

export interface PriceHistoryMap {
  [key: string]: number[];
}

export function readPrices(): PriceHistoryMap {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export function writePrices(data: PriceHistoryMap) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
