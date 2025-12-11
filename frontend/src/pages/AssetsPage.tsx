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
          padding: 0; /* контролируем вручную */
        }

        .cell {
          padding: 14px 0;
          font-size: 14px;
          white-space: nowrap;
          vertical-align: middle;
        }

        /* Заголовки — чуть крупнее и белее */
        th .cell {
          font-weight: 600;
          color: #d4d4d8;
          font-size: 15px; /* ← УВЕЛИЧИЛИ */
        }

        td .cell {
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

      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <table className="assets-table">

          <colgroup>
            <col style={{ width: "60px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "110px" }} />
            <col style={{ width: "110px" }} />
            <col style={{ width: "110px" }} />
            <col style={{ width: "160px" }} />
            <col style={{ width: "160px" }} />
            <col style={{ width: "240px" }} />
          </colgroup>

          <thead>
            <tr>
              <th><div className="cell" style={{ paddingLeft: 24 }}>#</div></th>
              <th><div className="cell">ASSET</div></th>
              <th><div className="cell" style={{ textAlign: "center" }}>PRICE</div></th>
              <th><div className="cell" style={{ textAlign: "center" }}>1h %</div></th>
              <th><div className="cell" style={{ textAlign: "center" }}>24h %</div></th>
              <th><div className="cell" style={{ textAlign: "center" }}>7d %</div></th>
              <th><div className="cell" style={{ textAlign: "center" }}>Market Cap</div></th>
              <th><div className="cell" style={{ textAlign: "center" }}>Volume (24h)</div></th>
              <th><div className="cell" style={{ textAlign: "right", paddingRight: 32 }}>Sparkline</div></th>
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
