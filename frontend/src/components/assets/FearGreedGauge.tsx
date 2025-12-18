type Props = {
  value: number; // 0–100
  width?: number;
  height?: number;
};

/* =========================
   Geometry helpers
========================= */

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad),
  };
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const p0 = polar(cx, cy, r, start);
  const p1 = polar(cx, cy, r, end);

  const largeArcFlag = Math.abs(end - start) > 180 ? 1 : 0;
  const sweepFlag = end < start ? 1 : 0;

  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${p1.x} ${p1.y}`;
}

/* =========================
   Component
========================= */

export function FearGreedGauge({
  value,
  width = 220,
  height = 120,
}: Props) {
  const cx = width / 2;
  const cy = height;
  const r = height - 20;
  const strokeWidth = 8;

  /* =========================
     Stepped gradient sectors
     (accent → blue → white)
  ========================= */

  const SECTORS = [
    { color: "var(--primary)" }, // фиолетовый
    { color: "#8FA4F9" },        // фиолетово-голубой
    { color: "var(--secondary)" }, // голубой
    { color: "#AEEBFA" },        // голубовато-белый
    { color: "#E6E6E6" },        // белый
  ];

  const stepAngle = 180 / SECTORS.length;

  const sectors = SECTORS.map((s, i) => ({
    from: 180 - i * stepAngle,
    to: 180 - (i + 1) * stepAngle,
    color: s.color,
  }));

  /* =========================
     Pointer (points to sector)
  ========================= */

  const clamped = Math.max(0, Math.min(100, value));
  const angle = 180 - (clamped / 100) * 180;
  const pointer = polar(cx, cy, r, angle);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      {/* Background arc */}
      <path
        d={arcPath(cx, cy, r, 180, 0)}
        stroke="var(--border)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* Stepped sectors */}
      {sectors.map((s, i) => (
        <path
          key={i}
          d={arcPath(cx, cy, r, s.from, s.to)}
          stroke={s.color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* Pointer */}
      <circle
        cx={pointer.x}
        cy={pointer.y}
        r={6}
        fill="var(--primary)"
        stroke="var(--surface)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
