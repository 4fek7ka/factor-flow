// simulationChart.utils.ts

export type FanQuantiles = {
  q05: number[];
  q25: number[];
  q50: number[];
  q75: number[];
  q95: number[];
};

export function resample<T>(arr: T[], target: number): T[] {
  if (arr.length <= target) return arr;

  const res: T[] = [];
  const step = (arr.length - 1) / (target - 1);

  for (let i = 0; i < target; i++) {
    res.push(arr[Math.round(i * step)]);
  }

  return res;
}

export function toPercentFromBase(values: number[], base: number): number[] {
  if (values.length === 0) return values;
  if (!Number.isFinite(base) || base === 0) return values.map(() => 0);
  return values.map((v) => ((v - base) / base) * 100);
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

function finiteOnly(values: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (Number.isFinite(v)) out.push(v);
  }
  return out;
}

/**
 * Builds a quantile "fan" from Monte Carlo paths.
 * Each path is an array of values over time, all paths must have the same length.
 */
export function buildFanQuantiles(paths: number[][]): FanQuantiles | null {
  if (!paths || paths.length === 0) return null;

  const T = paths[0]?.length ?? 0;
  if (T === 0) return null;

  // Ensure consistent lengths
  for (let p = 0; p < paths.length; p++) {
    if ((paths[p]?.length ?? 0) !== T) return null;
  }

  const q05: number[] = new Array(T);
  const q25: number[] = new Array(T);
  const q50: number[] = new Array(T);
  const q75: number[] = new Array(T);
  const q95: number[] = new Array(T);

  for (let t = 0; t < T; t++) {
    const col: number[] = new Array(paths.length);
    for (let p = 0; p < paths.length; p++) {
      col[p] = paths[p]![t]!;
    }

    const vals = finiteOnly(col);
    if (vals.length === 0) {
      q05[t] = 0;
      q25[t] = 0;
      q50[t] = 0;
      q75[t] = 0;
      q95[t] = 0;
      continue;
    }

    vals.sort((a, b) => a - b);

    q05[t] = quantileSorted(vals, 0.05);
    q25[t] = quantileSorted(vals, 0.25);
    q50[t] = quantileSorted(vals, 0.5);
    q75[t] = quantileSorted(vals, 0.75);
    q95[t] = quantileSorted(vals, 0.95);
  }

  return { q05, q25, q50, q75, q95 };
}

export function resampleFan(fan: FanQuantiles, target: number): FanQuantiles {
  return {
    q05: resample(fan.q05, target),
    q25: resample(fan.q25, target),
    q50: resample(fan.q50, target),
    q75: resample(fan.q75, target),
    q95: resample(fan.q95, target),
  };
}
