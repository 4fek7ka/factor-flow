import type { AssetRow } from "../../services/assets/assetsSelectors";
import { AssetRowItem } from "./AssetRow";

type Props = {
  assets: AssetRow[];
  livePrices?: Record<string, number>;
};

export function AssetsTable({ assets, livePrices }: Props) {
  return (
    <>
      <style>{`
        .assets-card {
          background: var(--surface, #111827);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          overflow-x: auto;
        }

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

        /* ===== Header ===== */

        th .cell {
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.4px;
          color: #E5E7EB;
        }

        /* ===== Rows ===== */

        .assets-table tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 120ms ease;
        }

        .assets-table tbody tr:last-child {
          border-bottom: none;
        }

        .assets-table tbody tr:hover {
          background: rgba(139,92,246,0.06);
        }
      `}</style>

      <div className="assets-card">
        <table className="assets-table">
          <colgroup>
            <col style={{ width: "60px" }} />
            <col style={{ width: "160px" }} />
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
                <div className="cell" style={{ paddingLeft: 24 }}>
                  #
                </div>
              </th>
              <th>
                <div className="cell">ASSET</div>
              </th>
              <th>
                <div
                  className="cell"
                  style={{ textAlign: "right", paddingRight: 16 }}
                >
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
                <div
                  className="cell"
                  style={{ textAlign: "right", paddingRight: 16 }}
                >
                  Market Cap
                </div>
              </th>
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
              <AssetRowItem
                key={`${asset.symbol}-${i}`}
                asset={asset}
                index={i}
                livePrice={livePrices?.[asset.symbol]}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
