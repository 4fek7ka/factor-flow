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
