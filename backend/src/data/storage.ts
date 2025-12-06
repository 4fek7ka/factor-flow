import fs from "fs";
import path from "path";

const filePath = path.join(__dirname, "prices.json");

export function readPrices(): Record<string, number> {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export function writePrices(data: Record<string, number>) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
