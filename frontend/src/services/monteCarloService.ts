// src/services/monteCarloService.ts

export type MonteCarloInput = {
  startValue: number;      // начальное значение (например, 100)
  driftPct: number;        // средний дневной рост (%)
  volatilityPct: number;   // дневная волатильность (%)
  horizonDays: number;     // горизонт прогноза в днях
  simulations: number;     // количество симулируемых траекторий
};

export type MonteCarloAdvancedOutput = {
  timestamps: number[];    // 0..N (дни)
  median: number[];        // медианная линия
  upper: number[];         // верхняя граница (прямая линия в координатах время-значение)
  lower: number[];         // нижняя граница (прямая линия)
  paths: number[][];       // все сгенерированные траектории
};

// простая нормальная случайная величина N(0,1)
function randomNormal(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Расширенный Monte Carlo:
 * - генерирует N траекторий
 * - считает медиану по каждой дате
 * - считает верхнюю/нижнюю границы:
 *   • в начале: ±5% от median[0]
 *   • в конце: среднее верхних 10% и нижних 10% значений
 *   • между началом и концом: линейная интерполяция (прямые линии)
 */
export function runMonteCarloAdvanced(
  input: MonteCarloInput
): MonteCarloAdvancedOutput {
  const { startValue, driftPct, volatilityPct, horizonDays, simulations } =
    input;

  // дни 0..N
  const timestamps = Array.from({ length: horizonDays + 1 }, (_, i) => i);

  const paths: number[][] = [];

  // 1) Генерируем все траектории
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

  // 2) Медиана по каждому дню
  const median: number[] = timestamps.map((idx) => {
    const values = paths.map((p) => p[idx]).sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    return values.length % 2 !== 0
      ? values[mid]
      : (values[mid - 1] + values[mid]) / 2;
  });

  // 3) Границы по конечной дате на основе верхних/нижних 10%
  const lastIndex = horizonDays;
  const endValues = paths.map((p) => p[lastIndex]).sort((a, b) => a - b);

  const k = Math.max(1, Math.floor(simulations * 0.1));

  const lowSlice = endValues.slice(0, k);
  const highSlice = endValues.slice(endValues.length - k);

  const avg = (arr: number[]) =>
    arr.reduce((sum, v) => sum + v, 0) / (arr.length || 1);

  const lowerEnd = avg(lowSlice);
  const upperEnd = avg(highSlice);

  // начало: узкий коридор ±5%
  const lowerStart = median[0] * 0.95;
  const upperStart = median[0] * 1.05;

  // 4) Строим прямые линии в координатах (день, значение)
  const lower: number[] = [];
  const upper: number[] = [];

  for (let i = 0; i <= horizonDays; i++) {
    const t = horizonDays === 0 ? 0 : i / horizonDays;

    const l = lowerStart + (lowerEnd - lowerStart) * t;
    const u = upperStart + (upperEnd - upperStart) * t;

    lower.push(l);
    upper.push(u);
  }

  return {
    timestamps,
    median,
    upper,
    lower,
    paths,
  };
}
