export function generateNextPrice(
  currentPrice: number,
  drift: number = 0.0005,
  volatility: number = 0.01
): number {
  const noise = (Math.random() * 2 - 1); // -1..1
  const change = drift + volatility * noise;
  return currentPrice * (1 + change);
}
