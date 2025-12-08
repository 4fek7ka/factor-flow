import type { Period } from "../services/portfolioService";

type Props = {
  tvl: number;
  lastTsMs: number;
  changeUsd: number;
  changePct: number;
  vsBtcPp: number; // оставляем имя поля из сервиса, чтобы не ломать остальной код
  btcPct: number;
  period: Period;
};

function fmtUsd(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

function fmtSignedUsd(v: number) {
  const sign = v >= 0 ? "+" : "-";
  return `${sign}${fmtUsd(Math.abs(v))}`;
}

function fmtSignedPct(v: number, digits = 2) {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(digits)}%`;
}

export function PortfolioMetricsRow({
  tvl,
  lastTsMs,
  changeUsd,
  changePct,
  vsBtcPp,
  btcPct,
  period,
}: Props) {
  const changeColorClass = changeUsd >= 0 ? "text-success" : "text-danger";
  const vsBtcColorClass = vsBtcPp >= 0 ? "text-success" : "text-danger";

  return (
    <div className="row row-cards mb-3">
      <div className="col-12 col-md-4">
        <div className="card card-sm">
          <div className="card-body">
            <div className="text-muted">TVL</div>
            <div className="h2 m-0">{fmtUsd(tvl)}</div>
            <div className="text-muted mt-1">
              {lastTsMs
                ? `As of ${new Date(lastTsMs).toLocaleDateString("en-GB")}`
                : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-4">
        <div className="card card-sm">
          <div className="card-body">
            <div className="text-muted">Net Change ({period})</div>
            <div className={`h2 m-0 ${changeColorClass}`}>
              {fmtSignedUsd(changeUsd)}
            </div>
            <div className="text-muted mt-1">({fmtSignedPct(changePct)})</div>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-4">
        <div className="card card-sm">
          <div className="card-body">
            <div className="text-muted">Vs BTC ({period})</div>
            {/* ✅ теперь показываем как % (без pp) */}
            <div className={`h2 m-0 ${vsBtcColorClass}`}>
              {fmtSignedPct(vsBtcPp)}
            </div>
            <div className="text-muted mt-1">
              (Portfolio: {fmtSignedPct(changePct)} · BTC: {fmtSignedPct(btcPct)})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
