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
const END_PENALTY_LAMBDA = 12;

/**
 * Регулировка долгосрочного роста рынка:
 * 1.0 = +100% в год (удвоение)
 * 0.5 = +50% в год
 * 0.0 = без добавочного тренда (чисто по истории)
 */
const LONG_TERM_ANNUAL_GROWTH = 0.3;

function annualGrowthToDailyLogDrift(annualGrowth: number): number {
  // annualGrowth = 1.0 => log(2)/365
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

  // 2) median
  const median = timestamps.map((i) => {
    const values = paths.map((p) => p[i]).sort((a, b) => a - b);
    const m = Math.floor(values.length / 2);
    return values.length % 2 ? values[m] : (values[m - 1] + values[m]) / 2;
  });

  // 3) bounds
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

  // 4) candidate filter: path must stay inside bounds
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

  // 5) representative selection
  let bestIdx = candidates[0];
  let bestDist = Infinity;

  const N = median.length - 1 || 1;
  const T = horizonDays;
  const medianEnd = median[T];

  for (const idx of candidates) {
    let dist = 0;

    for (let i = 0; i < median.length; i++) {
      const w = (i / N) ** 2;
      const d = paths[idx][i] - median[i];
      dist += w * d * d;
    }

    const endDiff = paths[idx][T] - medianEnd;
    dist += END_PENALTY_LAMBDA * endDiff * endDiff;

    if (dist < bestDist) {
      bestDist = dist;
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
