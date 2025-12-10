import type { AssetRow } from "../../services/assetsService";
import { AssetSparkline } from "../../charts/AssetSparkline";

type Props = {
  asset: AssetRow;
  index: number;
};

export function AssetRowItem({ asset, index }: Props) {
  const isUp = asset.change24hPct >= 0;
  const color = isUp ? "#4ADE80" : "#F87171";

  return (
    <tr>
      <td style={{ paddingLeft: 24, color: "#A1A1AA" }}>
        {index + 1}
      </td>

      <td style={{ fontWeight: 600, color: "#F4F4F5" }}>
        {asset.symbol}
      </td>

      <td style={{ color: "#E4E4E7" }}>
        ${asset.price.toFixed(2)}
      </td>

      <td style={{ color }}>
        {isUp ? "+" : ""}
        {asset.change24hPct.toFixed(2)}%
      </td>

      <td style={{ textAlign: "right", paddingRight: 24 }}>
        <div style={{ width: 180, display: "inline-block" }}>
          <AssetSparkline data={asset.sparkline} positive={isUp} />
        </div>
      </td>
    </tr>
  );
}
