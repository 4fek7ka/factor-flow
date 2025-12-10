

type Props = {
  values: number[];
  color: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
};

export function SparklineBase({
  values,
  color,
  width = 120,
  height = 40,
  strokeWidth = 2,
}: Props) {
  if (!values.length) return null;

  // 1) Переводим значения в % относительно первой точки
  const base = values[0];
  const pctValues = values.map((v) => ((v - base) / base) * 100);

  // 2) Локальный диапазон
  const min = Math.min(...pctValues);
  const max = Math.max(...pctValues);
  const range = max - min || 0;

  // 3) Волатильность → динамический scale
  const A = Math.abs(range);
  const K = 1.5; // чувствительность волатильности
  const scale = A === 0 ? 0 : Math.min(1, A / (A + K));

  const centerY = height / 2;

  // 4) Строим polyline
  const points = pctValues
    .map((v, i) => {
      const norm = range === 0 ? 0.5 : (v - min) / range; // 0..1
      const normCentered = norm - 0.5; // -0.5..0.5
      const y = centerY - normCentered * height * scale;
      const x = (i / Math.max(values.length - 1, 1)) * width;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}
