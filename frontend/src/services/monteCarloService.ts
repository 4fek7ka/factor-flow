export type MonteCarloInput = {
  startValue: number;
  driftPct: number;
  volatilityPct: number;
  horizonDays: number;
  simulations: number;
};

export type MonteCarloAdvancedOutput = {
  timestamps: number[];
  median: number[];
  representative: number[];
  upper: number[];
  lower: number[];
  paths: number[][];
};

function randomNormal(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function runMonteCarloAdvanced(
  input: MonteCarloInput
): MonteCarloAdvancedOutput {
  const { startValue, driftPct, volatilityPct, horizonDays, simulations } =
    input;

  const timestamps = Array.from({ length: horizonDays + 1 }, (_, i) => i);
  const paths: number[][] = [];

  // generate paths
  for (let s = 0; s < simulations; s++) {
    const path: number[] = [startValue];
    for (let i = 1; i <= horizonDays; i++) {
      const prev = path[i - 1];
      const noise = randomNormal() * volatilityPct;
      const next = prev * (1 + driftPct / 100 + noise / 100);
      path.push(next);
    }
    paths.push(path);
  }

  // median
  const median: number[] = timestamps.map((i) => {
    const values = paths.map((p) => p[i]).sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    return values.length % 2
      ? values[mid]
      : (values[mid - 1] + values[mid]) / 2;
  });

  // representative path (closest to median)
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

  // end bounds (top/bottom 20%)
  const endValues = paths.map((p) => p[horizonDays]).sort((a, b) => a - b);
  const k = Math.max(1, Math.floor(simulations * 0.2));

  const avg = (arr: number[]) =>
    arr.reduce((s, v) => s + v, 0) / arr.length;

  const lowerEnd = avg(endValues.slice(0, k));
  const upperEnd = avg(endValues.slice(endValues.length - k));

  // start bounds ±10%
  const lowerStart = median[0] * 0.9;
  const upperStart = median[0] * 1.1;

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
