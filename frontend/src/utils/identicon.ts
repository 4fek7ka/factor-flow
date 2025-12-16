// frontend/src/utils/identicon.ts

function fnv1a32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    // h *= 16777619 (через сдвиги, чтобы стабильно в JS)
    h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0;
  }
  return h >>> 0;
}

function xorshift32(seed: number): () => number {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 0xffffffff;
  };
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function colorFromSeed(seed: number): string {
  // приятная "tabler-like" палитра через HSL
  const hue = seed % 360;
  const sat = 65;
  const light = 52;
  return `hsl(${hue} ${sat}% ${light}%)`;
}

export type IdenticonOptions = {
  size?: number; // px
  cells?: number; // grid size, default 5
  padding?: number; // px
  bg?: string; // background
};

export function buildIdenticonSvg(
  address: string,
  opts: IdenticonOptions = {}
): string {
  const size = opts.size ?? 40;
  const cells = opts.cells ?? 5;
  const padding = opts.padding ?? 4;
  const bg = opts.bg ?? "rgba(255,255,255,0.06)";

  const normalized = (address || "").trim().toLowerCase();
  const seed = fnv1a32(normalized || "0x0");
  const rnd = xorshift32(seed);

  const color = colorFromSeed(seed);
  const cellSize = (size - padding * 2) / cells;

  // зеркалим по вертикали: рисуем только половину + центр
  const half = Math.ceil(cells / 2);

  const on: boolean[][] = Array.from({ length: cells }, () =>
    Array.from({ length: cells }, () => false)
  );

  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < half; x++) {
      const v = rnd();
      const filled = v > 0.5; // плотность
      on[y][x] = filled;
      on[y][cells - 1 - x] = filled;
    }
  }

  // слегка скруглим
  const r = clamp(cellSize * 0.22, 1.5, 4);

  const rects: string[] = [];
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      if (!on[y][x]) continue;
      const rx = padding + x * cellSize;
      const ry = padding + y * cellSize;
      rects.push(
        `<rect x="${rx.toFixed(2)}" y="${ry.toFixed(2)}" width="${cellSize.toFixed(
          2
        )}" height="${cellSize.toFixed(2)}" rx="${r.toFixed(
          2
        )}" fill="${color}"/>`
      );
    }
  }

  // круглая маска под "аватар"
  const maskId = `m_${seed.toString(16)}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <mask id="${maskId}">
      <rect x="0" y="0" width="${size}" height="${size}" rx="${(size / 2).toFixed(
    2
  )}" fill="white"/>
    </mask>
  </defs>

  <g mask="url(#${maskId})">
    <rect x="0" y="0" width="${size}" height="${size}" fill="${bg}"/>
    ${rects.join("\n    ")}
  </g>
</svg>`;
}

export function buildIdenticonDataUri(
  address: string,
  opts: IdenticonOptions = {}
): string {
  const svg = buildIdenticonSvg(address, opts)
    // чуть чистим для data-uri
    .replace(/\n+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  // безопасная encode
  const encoded = encodeURIComponent(svg)
    .replace(/%20/g, " ")
    .replace(/%3D/g, "=")
    .replace(/%3A/g, ":")
    .replace(/%2F/g, "/");

  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}
