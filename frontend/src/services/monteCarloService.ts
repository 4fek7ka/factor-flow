export type Scenario = "conservative" | "baseline" | "stress";

export type MonteCarloInput = {
  startValue: number;
  drift: number;       // μ, log-return per day
  volatility: number;  // σ, log-return std per day
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

/* ================================
   Deterministic RNG (fixed seed)
   ================================ */

const FIXED_SEED = 42;

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

/* ================================
   Monte Carlo Simulation (GBM)
   ================================ */

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

  const timestamps = Array.from({ length: horizonDays + 1 }, (_, i) => i);
  const paths: number[][] = [];

  // 1) paths
  for (let s = 0; s < simulations; s++) {
    const path: number[] = [startValue];

    for (let t = 1; t <= horizonDays; t++) {
      const prev = path[t - 1];
      const z = randomNormal(rng);
      path.push(prev * Math.exp(drift + sigma * z));
    }

    paths.push(path);
  }

  // 2) median
  const median = timestamps.map((i) => {
    const values = paths.map((p) => p[i]).sort((a, b) => a - b);
    const m = Math.floor(values.length / 2);
    return values.length % 2
      ? values[m]
      : (values[m - 1] + values[m]) / 2;
  });

  // 3) representative
  let bestIdx = 0;
  let bestDist = Infinity;

  for (let k = 0; k < paths.length; k++) {
    let dist = 0;
    for (let i = 0; i < median.length; i++) {
      const d = paths[k][i] - median[i];
      dist += d * d;
    }
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = k;
    }
  }

  const representative = paths[bestIdx];

  // 4) horizon bounds (20%)
  const endValues = paths.map((p) => p[horizonDays]).sort((a, b) => a - b);
  const k = Math.max(1, Math.floor(simulations * 0.2));

  const avg = (xs: number[]) =>
    xs.reduce((s, v) => s + v, 0) / xs.length;

  const lowerEnd = avg(endValues.slice(0, k));
  const upperEnd = avg(endValues.slice(endValues.length - k));

  // 5) start bounds ±5%
  const lowerStart = median[0] * 0.95;
  const upperStart = median[0] * 1.05;

  const lower: number[] = [];
  const upper: number[] = [];

  for (let i = 0; i <= horizonDays; i++) {
    const t = horizonDays === 0 ? 0 : i / horizonDays;
    lower.push(lowerStart + (lowerEnd - lowerStart) * t);
    upper.push(upperStart + (upperEnd - upperStart) * t);
  }

  return {
    timestamps,
    median,
    representative,
    upper,
    lower,
    paths,
  };
}
