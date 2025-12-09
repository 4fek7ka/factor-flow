// src/services/moodService.ts
import type { HistoryPoint } from "./portfolioService";

export type MarketMood = {
  fearFactor: number; // 0–100
  label: "Extreme Fear" | "Fear" | "Neutral" | "Greed" | "Extreme Greed";
  volatilityScore: number; // 0–100
  gainersScore: number; // 0–100
  momentumScore: number; // 0–100
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// последние N часов
function sliceLastHours(history: HistoryPoint[], hours: number): HistoryPoint[] {
  if (!history.length) return [];
  const lastTs = history[history.length - 1].timestamp; // sec
  const cutoff = lastTs - hours * 3600;
  return history.filter((p) => p.timestamp >= cutoff);
}

// средняя абсолютная волатильность % за шаг (по всем активам)
function calcVolatilityScore(history: HistoryPoint[]): number {
  if (history.length < 2) return 0;

  const assets = Object.keys(history[0].prices) as (keyof HistoryPoint["prices"])[];
  const deltas: number[] = [];

  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1].prices;
    const curr = history[i].prices;

    for (const a of assets) {
      const p0 = prev[a];
      const p1 = curr[a];
      if (!p0) continue;
      const pct = ((p1 - p0) / p0) * 100;
      deltas.push(Math.abs(pct));
    }
  }

  if (!deltas.length) return 0;
  const avgAbs = deltas.reduce((s, x) => s + x, 0) / deltas.length;

  // мапим: 0–5% → 0–100
  const score = avgAbs * 20;
  return clamp(score, 0, 100);
}

// доля активов, которые выросли за период, в %
function calcGainersScore(history: HistoryPoint[]): number {
  if (history.length < 2) return 0;

  const first = history[0].prices;
  const last = history[history.length - 1].prices;
  const assets = Object.keys(first) as (keyof HistoryPoint["prices"])[];

  let gainers = 0;
  let total = 0;

  for (const a of assets) {
    const p0 = first[a];
    const p1 = last[a];
    if (!p0) continue;
    total++;
    if (p1 > p0) gainers++;
  }

  if (!total) return 0;
  return (gainers / total) * 100;
}

// простой расчёт портфельного PnL за период (для настроения)
function calcMomentumScore(history: HistoryPoint[]): number {
  if (history.length < 2) return 50;

  const first = history[0];
  const last = history[history.length - 1];

  const assets = Object.keys(first.prices) as (keyof HistoryPoint["prices"])[];
  // условно считаем равный вес по активам (только для настроения, не для отчёта)
  let v0 = 0;
  let v1 = 0;

  for (const a of assets) {
    const p0 = first.prices[a];
    const p1 = last.prices[a];
    v0 += p0;
    v1 += p1;
  }

  if (!v0) return 50;
  const pnlPct = ((v1 - v0) / v0) * 100;

  //  -25% → 0, 0% → 50, +25% → 100
  const score = 50 + pnlPct * 2;
  return clamp(score, 0, 100);
}

function moodLabel(value: number): MarketMood["label"] {
  if (value < 20) return "Extreme Fear";
  if (value < 40) return "Fear";
  if (value < 60) return "Neutral";
  if (value < 80) return "Greed";
  return "Extreme Greed";
}

// публичная функция: считаем "настроение рынка" по последним 24 часам
export function buildMarketMood(history: HistoryPoint[]): MarketMood {
  const last24h = sliceLastHours(history, 24);
  if (!last24h.length) {
    return {
      fearFactor: 50,
      label: "Neutral",
      volatilityScore: 0,
      gainersScore: 0,
      momentumScore: 50,
    };
  }

  const volatilityScore = calcVolatilityScore(last24h);
  const gainersScore = calcGainersScore(last24h);
  const momentumScore = calcMomentumScore(last24h);

  // комбинируем, как договаривались
  const fearFactorRaw =
    0.4 * (100 - volatilityScore) +
    0.3 * gainersScore +
    0.3 * momentumScore;

  const fearFactor = clamp(fearFactorRaw, 0, 100);
  const label = moodLabel(fearFactor);

  return {
    fearFactor,
    label,
    volatilityScore,
    gainersScore,
    momentumScore,
  };
}
