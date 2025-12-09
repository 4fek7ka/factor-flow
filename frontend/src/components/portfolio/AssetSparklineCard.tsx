

type Props = {
  name: string;
  values: number[];
  pct: number;
  label?: string;
};

export function AssetSparklineCard({ name, values, pct, label }: Props) {
  if (!values.length) return null;

  // 1) Переводим цены в % изменения от первой точки
  const base = values[0];
  const pctValues = values.map((v) => ((v - base) / base) * 100); // в процентах

  const w = 120;
  const h = 40;

  // 2) Локальный диапазон по % (для конкретного актива)
  const min = Math.min(...pctValues);
  const max = Math.max(...pctValues);
  const range = max - min || 0;

  // 3) Динамический scale по волатильности
  // A — амплитуда в %, k — чувствительность
  const A = Math.abs(range);
  const K = 1.5; // можно потом подправить (1–3)
  const scale = A === 0 ? 0 : Math.min(1, A / (A + K)); // 0..1

  const centerY = h / 2;

  const points = pctValues
    .map((v, i) => {
      // нормализуем в [0;1]
      const norm = range === 0 ? 0.5 : (v - min) / range; // 0..1
      const normCentered = norm - 0.5; // -0.5..0.5

      // высота колебаний = h * scale, центр по вертикали
      const y = centerY - normCentered * h * scale;
      const x = (i / Math.max(values.length - 1, 1)) * w;
      return `${x},${y}`;
    })
    .join(" ");

  const isUp = pct >= 0;
  const color = isUp ? "#22c55e" : "#ef4444";
  const pctStr = `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;

  return (
    <div className="card card-sm" style={{ flex: 1, minWidth: 150 }}>
      <div className="card-body">
        {/* header */}
        <div className="d-flex justify-content-between mb-1">
          <div className="text-muted">{name}</div>
          <div style={{ color }}>{pctStr}</div>
        </div>

        {/* период (например 24H) */}
        {label && (
          <div
            style={{
              fontSize: 12,
              color: "#888",
              marginTop: -2,
              marginBottom: 6,
            }}
          >
            {label}
          </div>
        )}

        {/* sparkline */}
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
          <polyline
            fill="none"
            stroke={color}
            strokeWidth={2}
            points={points}
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
