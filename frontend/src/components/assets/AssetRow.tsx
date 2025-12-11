import type { AssetRow } from "../../services/assetsService";
import { SparklineBase } from "../../charts/SparklineBase";

type Props = {
  asset: AssetRow;
  index: number;
};

function colorize(v: number) {
  return v >= 0 ? "#4ADE80" : "#F87171";
}

function fmtBig(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n}`;
}

export function AssetRowItem({ asset, index }: Props) {
  return (
    <tr>
      {/* Index */}
      <td>
        <div
          className="cell"
          style={{ paddingLeft: 24, textAlign: "left", color: "#A1A1AA" }}
        >
          {index + 1}
        </div>
      </td>

      {/* Asset Symbol */}
      <td>
        <div
          className="cell"
          style={{ textAlign: "left", fontWeight: 600, color: "#F4F4F5" }}
        >
          {asset.symbol}
        </div>
      </td>

      {/* Price */}
      <td>
        <div
          className="cell"
          style={{ textAlign: "right", paddingRight: 16, color: "#E4E4E7" }}
        >
          ${asset.price.toFixed(2)}
        </div>
      </td>

      {/* 1h */}
      <td>
        <div
          className="cell"
          style={{
            textAlign: "center",
            color: colorize(asset.change1hPct),
          }}
        >
          {asset.change1hPct >= 0 ? "+" : ""}
          {asset.change1hPct.toFixed(2)}%
        </div>
      </td>

      {/* 24h */}
      <td>
        <div
          className="cell"
          style={{
            textAlign: "center",
            color: colorize(asset.change24hPct),
          }}
        >
          {asset.change24hPct >= 0 ? "+" : ""}
          {asset.change24hPct.toFixed(2)}%
        </div>
      </td>

      {/* 7d */}
      <td>
        <div
          className="cell"
          style={{
            textAlign: "center",
            color: colorize(asset.change7dPct),
          }}
        >
          {asset.change7dPct >= 0 ? "+" : ""}
          {asset.change7dPct.toFixed(2)}%
        </div>
      </td>

      {/* Market Cap */}
      <td>
        <div
          className="cell"
          style={{ textAlign: "right", paddingRight: 16, color: "#E5E7EB" }}
        >
          {fmtBig(asset.marketCapUsd)}
        </div>
      </td>

      {/* Sparkline */}
      <td>
        <div className="cell" style={{ textAlign: "right", paddingRight: 32 }}>
          <div style={{ width: 200, display: "inline-block" }}>
            <SparklineBase
              values={asset.sparkline}
              color={asset.change24hPct >= 0 ? "#4ADE80" : "#F87171"}
              width={150}
              height={34}
            />
          </div>
        </div>
      </td>
    </tr>
  );
}
