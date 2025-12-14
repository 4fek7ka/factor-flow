import { AssetRowItem } from "./AssetRow";
import type { AssetRow } from "../../services/assetsService";

type Props = {
  assets: AssetRow[];
};

export function AssetsTable({ assets }: Props) {
  return (
    <>
      <style>{`
        .assets-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .assets-table th,
        .assets-table td {
          padding: 0;
        }

        .cell {
          height: 48px;
          line-height: 48px;
          font-size: 14px;
          white-space: nowrap;
          vertical-align: middle;
        }

        th .cell {
          font-weight: 600;
          font-size: 15px;
          color: #e5e7eb;
          letter-spacing: 0.25px;
        }

        .assets-table tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .assets-table tbody tr:hover {
          background: rgba(255,255,255,0.03);
        }
      `}</style>

      <div className="card" style={{ padding: 0, overflowX: "auto", marginTop: 8 }}>
        <table className="assets-table">
          <colgroup>
            <col style={{ width: "60px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "110px" }} />
            <col style={{ width: "110px" }} />
            <col style={{ width: "110px" }} />
            <col style={{ width: "180px" }} />
            <col style={{ width: "240px" }} />
          </colgroup>

          <thead>
            <tr>
              <th>
                <div className="cell" style={{ paddingLeft: 24, textAlign: "left" }}>
                  #
                </div>
              </th>

              <th>
                <div className="cell" style={{ textAlign: "left" }}>
                  ASSET
                </div>
              </th>

              <th>
                <div className="cell" style={{ textAlign: "right", paddingRight: 16 }}>
                  PRICE
                </div>
              </th>

              <th>
                <div className="cell" style={{ textAlign: "center" }}>
                  1h %
                </div>
              </th>

              <th>
                <div className="cell" style={{ textAlign: "center" }}>
                  24h %
                </div>
              </th>

              <th>
                <div className="cell" style={{ textAlign: "center" }}>
                  7d %
                </div>
              </th>

              <th>
                <div className="cell" style={{ textAlign: "right", paddingRight: 16 }}>
                  Market Cap
                </div>
              </th>

              <th>
                <div className="cell" style={{ textAlign: "right", paddingRight: 32 }}>
                  Sparkline
                </div>
              </th>
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
