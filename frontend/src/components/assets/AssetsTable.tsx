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

      <div
        className="card"
        style={{ padding: 0, overflowX: "auto", marginTop: 8 }}
      >
        <table className="assets-table">
          <colgroup>
            <col style={{ width: "60px" }} />   {/* # */}
            <col style={{ width: "130px" }} />  {/* ASSET */}
            <col style={{ width: "150px" }} />  {/* PRICE */}
            <col style={{ width: "110px" }} />  {/* 1h % */}
            <col style={{ width: "110px" }} />  {/* 24h % */}
            <col style={{ width: "110px" }} />  {/* 7d % */}
            <col style={{ width: "180px" }} />  {/* Market Cap */}
            <col style={{ width: "240px" }} />  {/* Sparkline */}
          </colgroup>

          <thead>
            <tr>
              {/* # */}
              <th>
                <div
                  className="cell"
                  style={{ paddingLeft: 24, textAlign: "left" }}
                >
                  #
                </div>
              </th>

              {/* ASSET */}
              <th>
                <div className="cell" style={{ textAlign: "left" }}>
                  ASSET
                </div>
              </th>

              {/* PRICE — выравниваем как в строке (справа + paddingRight: 16) */}
              <th>
                <div
                  className="cell"
                  style={{
                    textAlign: "right",
                    paddingRight: 16,
                  }}
                >
                  PRICE
                </div>
              </th>

              {/* 1h % */}
              <th>
                <div className="cell" style={{ textAlign: "center" }}>
                  1h %
                </div>
              </th>

              {/* 24h % */}
              <th>
                <div className="cell" style={{ textAlign: "center" }}>
                  24h %
                </div>
              </th>

              {/* 7d % */}
              <th>
                <div className="cell" style={{ textAlign: "center" }}>
                  7d %
                </div>
              </th>

              {/* Market Cap — тоже как в строке (право + paddingRight: 16) */}
              <th>
                <div
                  className="cell"
                  style={{
                    textAlign: "right",
                    paddingRight: 16,
                  }}
                >
                  Market Cap
                </div>
              </th>

              {/* Sparkline — уже совпадает с телом */}
              <th>
                <div
                  className="cell"
                  style={{ textAlign: "right", paddingRight: 32 }}
                >
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
