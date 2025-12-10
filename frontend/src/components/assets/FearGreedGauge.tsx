
type Props = {
  value: number; // 0–100
  width?: number;
  height?: number;
};

// Полярные координаты → (x, y)
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad), // минус → верхняя полудуга
  };
}

// Построение пути дуги от startAngle до endAngle
function buildArcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const p0 = polar(cx, cy, r, start);
  const p1 = polar(cx, cy, r, end);

  const largeArcFlag = Math.abs(end - start) > 180 ? 1 : 0;
  const sweepFlag = end < start ? 1 : 0; // слева → направо

  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${p1.x} ${p1.y}`;
}

export function FearGreedGauge({
  value,
  width = 220,
  height = 120,
}: Props) {
  // Центр круга находится ниже viewBox
  const cx = width / 2;
  const cy = height;
  const r = height - 20;

  // ✔ ТОНКАЯ дуга
  const strokeWidth = 8;

  // Сегменты гейджа 0–100
  const segments = [
    { from: 180, to: 144, color: "#ef4444" }, // 0–20
    { from: 144, to: 108, color: "#f97316" }, // 20–40
    { from: 108, to: 72,  color: "#eab308" }, // 40–60
    { from: 72,  to: 36,  color: "#84cc16" }, // 60–80
    { from: 36,  to: 0,   color: "#22c55e" }, // 80–100
  ];

  // Позиция pointer'а
  const clamped = Math.max(0, Math.min(100, value));
  const angle = 180 - (clamped / 100) * 180;
  const pointer = polar(cx, cy, r, angle);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      {/* Цветные сегменты одной полудуги */}
      {segments.map((seg, i) => (
        <path
          key={i}
          d={buildArcPath(cx, cy, r, seg.from, seg.to)}
          stroke={seg.color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"  // ❗ делает линию реально тоньше
        />
      ))}

      {/* Pointer */}
      <circle
        cx={pointer.x}
        cy={pointer.y}
        r={6}
        fill="#ffffff"
        stroke="#020617"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke" // ❗ pointer тоже не масштабируется
      />
    </svg>
  );
}
