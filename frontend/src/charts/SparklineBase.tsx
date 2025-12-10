

type Props = {
  values: number[];
  color: string;
  width?: number;         // internal viewBox width (fixed mode)
  height?: number;
  strokeWidth?: number;
  fullWidth?: boolean;    // NEW: adaptive width mode
};

export function SparklineBase({
  values,
  color,
  width = 200,
  height = 45,
  strokeWidth = 2,
  fullWidth = false,
}: Props) {
  if (!values.length) return null;

  // 1) Convert to percent change
  const base = values[0];
  const pctValues = values.map((v) => ((v - base) / base) * 100);

  // 2) Range
  const min = Math.min(...pctValues);
  const max = Math.max(...pctValues);
  const range = max - min || 0;

  // 3) Volatility scale
  const A = Math.abs(range);
  const K = 1.5;
  const scale = A === 0 ? 0 : Math.min(1, A / (A + K));

  const centerY = height / 2;

  // 4) Build polyline
  const points = pctValues
    .map((v, i) => {
      const norm = range === 0 ? 0.5 : (v - min) / range;
      const normCentered = norm - 0.5;
      const y = centerY - normCentered * height * scale;
      const x = (i / Math.max(values.length - 1, 1)) * width;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={fullWidth ? "100%" : width}     // dynamic or fixed width
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={fullWidth ? "none" : "xMidYMid meet"}
    >
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
