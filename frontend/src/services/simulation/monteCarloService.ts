// frontend/src/services/monteCarloService.ts

export type Scenario = "conservative" | "baseline" | "stress";

export type MonteCarloInput = {
  startValue: number;
  drift: number; // daily log-return (historical)
  volatility: number; // daily vol of log-returns (historical)
  horizonDays: number;
  simulations: number;
  scenario: Scenario;
};

export type MonteCarloAdvancedOutput = {
  timestamps: number[];
  median: number[];
  representative: number[];
  upper: number[];
  lower: number[];
  paths: number[][];
};

const SCENARIO_VOL_MULTIPLIER: Record<Scenario, number> = {
  conservative: 0.7,
  baseline: 1.0,
  stress: 1.5,
};

const START_RANGE_PCT: Record<Scenario, number> = {
  conservative: 0.03,
  baseline: 0.05,
  stress: 0.07,
};

const FIXED_SEED = 42;

/**
 * Регулировка долгосрочного роста рынка:
 * 1.0 = +100% в год (удвоение)
 * 0.5 = +50% в год
 * 0.0 = без добавочного тренда (чисто по истории)
 */
const LONG_TERM_ANNUAL_GROWTH = 0.5;

function annualGrowthToDailyLogDrift(annualGrowth: number): number {
  if (!Number.isFinite(annualGrowth) || annualGrowth <= -1) return 0;
  return Math.log(1 + annualGrowth) / 365;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function randomNormal(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function quantileSorted(sorted: number[], q: number): number {
  const n = sorted.length;
  if (n === 0) return 0;
  if (n === 1) return sorted[0];

  const qq = Math.max(0, Math.min(1, q));
  const pos = (n - 1) * qq;
  const base = Math.floor(pos);
  const rest = pos - base;

  const left = sorted[base]!;
  const right = sorted[Math.min(base + 1, n - 1)]!;
  return left + (right - left) * rest;
}

export function runMonteCarloAdvanced(
  input: MonteCarloInput
): MonteCarloAdvancedOutput {
  const {
    startValue,
    drift,
    volatility,
    horizonDays,
    simulations,
    scenario,
  } = input;

  const sigma = volatility * SCENARIO_VOL_MULTIPLIER[scenario];
  const rng = mulberry32(FIXED_SEED);

  // ✅ добавляем структурный тренд вверх (регулируется одной константой)
  const longTermDailyDrift = annualGrowthToDailyLogDrift(
    LONG_TERM_ANNUAL_GROWTH
  );
  const effectiveDrift = drift + longTermDailyDrift;

  const timestamps = Array.from({ length: horizonDays + 1 }, (_, i) => i);
  const paths: number[][] = [];

  // 1) paths
  for (let s = 0; s < simulations; s++) {
    const path: number[] = [startValue];

    for (let t = 1; t <= horizonDays; t++) {
      const prev = path[t - 1];
      const z = randomNormal(rng);
      path.push(prev * Math.exp(effectiveDrift + sigma * z));
    }

    paths.push(path);
  }

  // 2) median + q25/q75 (fan inner corridor)
  const median: number[] = new Array(timestamps.length);
  const q25: number[] = new Array(timestamps.length);
  const q75: number[] = new Array(timestamps.length);

  for (let i = 0; i < timestamps.length; i++) {
    const values = paths.map((p) => p[i]).sort((a, b) => a - b);

    // median (как было)
    const m = Math.floor(values.length / 2);
    median[i] =
      values.length % 2 ? values[m] : (values[m - 1] + values[m]) / 2;

    // q25 / q75 (для радиуса)
    q25[i] = quantileSorted(values, 0.25);
    q75[i] = quantileSorted(values, 0.75);
  }

  // 3) bounds (как и было — они всё ещё используются для lower/upper на графике)
  const endValues = paths.map((p) => p[horizonDays]).sort((a, b) => a - b);
  const k = Math.max(1, Math.floor(simulations * 0.2));

  const avg = (xs: number[]) => xs.reduce((s, v) => s + v, 0) / xs.length;

  const lowerEnd = avg(endValues.slice(0, k));
  const upperEnd = avg(endValues.slice(endValues.length - k));

  const startPct = START_RANGE_PCT[scenario];
  const lowerStart = median[0] * (1 - startPct);
  const upperStart = median[0] * (1 + startPct);

  const lower: number[] = [];
  const upper: number[] = [];

  for (let i = 0; i <= horizonDays; i++) {
    const t = horizonDays === 0 ? 0 : i / horizonDays;
    lower.push(lowerStart + (lowerEnd - lowerStart) * t);
    upper.push(upperStart + (upperEnd - upperStart) * t);
  }

  // 4) candidate filter: path must stay inside bounds (оставляем)
  const validIndices: number[] = [];

  for (let p = 0; p < paths.length; p++) {
    let ok = true;
    for (let i = 0; i <= horizonDays; i++) {
      if (paths[p][i] < lower[i] || paths[p][i] > upper[i]) {
        ok = false;
        break;
      }
    }
    if (ok) validIndices.push(p);
  }

  const candidates =
    validIndices.length > 0 ? validIndices : paths.map((_, i) => i); // fallback

  /* =========================
     5) representative selection (НОВОЕ: радиус из q25–q75)
     - радиус = min(median-q25, q75-median)
     - квадратичный приоритет ближе к концу
     - штраф квадратичный по нормированной дистанции
     - если вышел за радиус — доп. штраф
  ========================= */

  const N = median.length - 1 || 1;
  const EPS = 1e-9;

  // насколько сильно наказывать выход за q25–q75 коридор
  const OUTSIDE_RADIUS_PENALTY = 10;

  let bestIdx = candidates[0];
  let bestScore = Infinity;

  for (const idx of candidates) {
    let score = 0;

    for (let i = 0; i < median.length; i++) {
      const w = (i / N) ** 2; // ближе к концу важнее (квадратично)

      const m = median[i];
      const x = paths[idx][i];

      const rLeft = m - q25[i];
      const rRight = q75[i] - m;

      // радиус вокруг медианы на базе fan(q25–q75)
      const radius = Math.max(EPS, Math.min(rLeft, rRight));

      const diff = Math.abs(x - m);
      const norm = diff / radius;

      // внутри радиуса: хотим ближе к центру
      let pen = norm * norm;

      // вне радиуса: штрафуем "вылет" (тоже квадратично)
      if (diff > radius) {
        const out = (diff - radius) / radius;
        pen += OUTSIDE_RADIUS_PENALTY * out * out;
      }

      score += w * pen;
    }

    if (score < bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
  }

  return {
    timestamps,
    median,
    representative: paths[bestIdx],
    upper,
    lower,
    paths,
  };
}
