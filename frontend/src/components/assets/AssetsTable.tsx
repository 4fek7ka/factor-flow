import { AssetRowItem } from "./AssetRow";
import type { AssetRow } from "../../services/assetsService";

type Props = {
  assets: AssetRow[];
};

export function AssetsTable({ assets }: Props) {
  return (
    <>
      {/* === INLINE STYLES === */}
      <style>{`
        .assets-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .assets-table th,
        .assets-table td {
          padding: 14px 0;
          font-size: 14px;
          white-space: nowrap;
          vertical-align: middle;
        }

        .assets-table th {
          font-weight: 600;
          color: #9ca3af;
        }

        .assets-table td {
          font-weight: 500;
          color: #e5e7eb;
        }

        .assets-table tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .assets-table tbody tr:hover {
          background: rgba(255,255,255,0.03);
        }
      `}</style>

      <div className="card" style={{ padding: "0", overflowX: "auto" }}>
        <table className="assets-table">
          <colgroup>
            <col style={{ width: "60px" }} />     {/* # */}
            <col style={{ width: "160px" }} />    {/* ASSET */}
            <col style={{ width: "180px" }} />    {/* PRICE */}
            <col style={{ width: "140px" }} />    {/* 24H */}
            <col style={{ width: "230px" }} />    {/* SPARKLINE */}
          </colgroup>

          <thead>
            <tr>
              <th style={{ paddingLeft: 24 }}>#</th>
              <th>ASSET</th>
              <th>PRICE</th>
              <th>24H</th>
              <th style={{ textAlign: "right", paddingRight: 24 }}>SPARKLINE</th>
            </tr>
          </thead>

          <tbody>
            {assets.map((asset, i) => (
              <AssetRowItem key={asset.symbol} asset={asset} index={i} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
