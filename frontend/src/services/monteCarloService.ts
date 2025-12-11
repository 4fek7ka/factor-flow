// src/services/monteCarloService.ts

export type MonteCarloInput = {
  startValue: number;     // начальная стоимость
  driftPct: number;       // дневной дрейф (%)
  volatilityPct: number;  // дневная волатильность (%)
  horizonDays: number;    // длительность симуляции в днях
  simulations: number;    // количество траекторий (advanced)
};

export type MonteCarloSimpleOutput = {
  timestamps: number[];
  median: number[];
  upper: number[];
  lower: number[];
};

export type MonteCarloAdvancedOutput = {
  timestamps: number[];
  paths: number[][];      // N траекторий
  median: number[];
  p10: number[];
  p90: number[];
};

/* ------------------------------------------------
   RANDOM NORMAL (Box–Muller)
--------------------------------------------------- */
function randomNormal() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/* ------------------------------------------------
   ONE TRAJECTORY
--------------------------------------------------- */
function generatePath(
  start: number,
  driftPct: number,
  volPct: number,
  horizon: number
): number[] {
  const drift = driftPct / 100;
  const vol = volPct / 100;

  const out = [start];
  for (let i = 1; i <= horizon; i++) {
    const prev = out[out.length - 1];
    const shock = randomNormal();
    const next = prev * (1 + drift + vol * shock);
    out.push(next);
  }
  return out;
}

/* ------------------------------------------------
   SIMPLE MODE: 3 TRAJECTORIES
--------------------------------------------------- */
export function runMonteCarloSimple(input: MonteCarloInput): MonteCarloSimpleOutput {
  const { startValue, driftPct, volatilityPct, horizonDays } = input;

  const median = generatePath(startValue, driftPct, volatilityPct, horizonDays);
  const upper = generatePath(startValue, driftPct, volatilityPct * 1.5, horizonDays);
  const lower = generatePath(startValue, driftPct, volatilityPct * 0.5, horizonDays);

  const timestamps = Array.from({ length: horizonDays + 1 }, (_, i) => i);

  return { timestamps, median, upper, lower };
}

/* ------------------------------------------------
   PERCENTILE
--------------------------------------------------- */
function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  const t = idx - lo;
  if (hi >= sorted.length) return sorted[lo];
  return sorted[lo] * (1 - t) + sorted[hi] * t;
}

/* ------------------------------------------------
   ADVANCED MODE: MANY TRAJECTORIES
--------------------------------------------------- */
export function runMonteCarloAdvanced(input: MonteCarloInput): MonteCarloAdvancedOutput {
  const { startValue, driftPct, volatilityPct, horizonDays, simulations } = input;

  const paths: number[][] = [];
  for (let i = 0; i < simulations; i++) {
    paths.push(generatePath(startValue, driftPct, volatilityPct, horizonDays));
  }

  const timestamps = Array.from({ length: horizonDays + 1 }, (_, i) => i);

  const median: number[] = [];
  const p10: number[] = [];
  const p90: number[] = [];

  for (let day = 0; day <= horizonDays; day++) {
    const valuesAtDay = paths.map((path) => path[day]);
    median.push(percentile(valuesAtDay, 50));
    p10.push(percentile(valuesAtDay, 10));
    p90.push(percentile(valuesAtDay, 90));
  }

  return { timestamps, paths, median, p10, p90 };
}
