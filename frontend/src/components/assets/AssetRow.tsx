import { useEffect, useRef, useState } from "react";
import type { AssetRow } from "../../services/assetsService";
import { SparklineBase } from "../../charts/SparklineBase";

type Props = {
  asset: AssetRow;
  index: number;
  livePrice?: number;
};

function colorize(v: number) {
  return v >= 0 ? "#4ADE80" : "#F87171";
}

export function AssetRowItem({ asset, index, livePrice }: Props) {
  const price = livePrice ?? asset.price;

  const prevRef = useRef<number>(price);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const prev = prevRef.current;

    if (price > prev) {
      setFlash("up");
      setFade(false);
    } else if (price < prev) {
      setFlash("down");
      setFade(false);
    }

    prevRef.current = price;

    if (price !== prev) {
      const t1 = setTimeout(() => setFade(true), 50);     // включаем fade
      const t2 = setTimeout(() => setFlash(null), 300); // сбрасываем flash

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [price]);

  const priceColor =
    flash === "up"
      ? "#22c55e"
      : flash === "down"
      ? "#ef4444"
      : "#E4E4E7";

  return (
    <tr>
      {/* Index */}
      <td>
        <div className="cell" style={{ paddingLeft: 24, color: "#A1A1AA" }}>
          {index + 1}
        </div>
      </td>

      {/* Asset */}
      <td>
        <div className="cell" style={{ fontWeight: 600, color: "#F4F4F5" }}>
          {asset.symbol}
        </div>
      </td>

      {/* Price */}
      <td>
        <div
          className="cell"
          style={{
            textAlign: "right",
            paddingRight: 16,
            color: priceColor,
            transition: fade ? "color 1.5s ease-out" : "none",
          }}
        >
          ${price.toFixed(2)}
        </div>
      </td>

      {/* 1h */}
      <td>
        <div
          className="cell"
          style={{ textAlign: "center", color: colorize(asset.change1hPct) }}
        >
          {asset.change1hPct.toFixed(2)}%
        </div>
      </td>

      {/* 24h */}
      <td>
        <div
          className="cell"
          style={{ textAlign: "center", color: colorize(asset.change24hPct) }}
        >
          {asset.change24hPct.toFixed(2)}%
        </div>
      </td>

      {/* 7d */}
      <td>
        <div
          className="cell"
          style={{ textAlign: "center", color: colorize(asset.change7dPct) }}
        >
          {asset.change7dPct.toFixed(2)}%
        </div>
      </td>

      {/* Market Cap */}
      <td>
        <div
          className="cell"
          style={{ textAlign: "right", paddingRight: 16, color: "#E5E7EB" }}
        >
          ${asset.marketCapUsd.toLocaleString()}
        </div>
      </td>

      {/* Sparkline */}
      <td>
        <div className="cell" style={{ textAlign: "right", paddingRight: 32 }}>
          <SparklineBase
            values={asset.sparkline}
            color={asset.change7dPct >= 0 ? "#4ADE80" : "#F87171"}
            width={150}
            height={34}
          />
        </div>
      </td>
    </tr>
  );
}
