import type { Period } from "../../services/portfolio/portfolioService";

type Props = {
  tvl: number;
  lastTsMs: number;
  changeUsd: number;
  changePct: number;
  vsBtcPp: number;
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
  const changeColor = changeUsd >= 0 ? "text-success" : "text-danger";
  const vsBtcColor = vsBtcPp >= 0 ? "text-success" : "text-danger";

  return (
    <div className="row row-cards mb-3">
      <style>{`
        .fade-number {
          opacity: 0;
          animation: fadeIn 220ms ease-out forwards;
        }

        .fade-sub {
          opacity: 0;
          animation: fadeIn 220ms ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* TVL — без анимации, не меняется от периода */}
      <div className="col-12 col-md-4">
        <div className="card card-sm">
          <div className="card-body">
            <div className="text-muted">TVL</div>

            {/* ❗ НЕТ key → нет анимации */}
            <div className="h2 m-0">{fmtUsd(tvl)}</div>

            <div className="text-muted mt-1 fade-sub" key={`asof`}>
              {lastTsMs
                ? `As of ${new Date(lastTsMs).toLocaleDateString("en-GB")}`
                : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Net Change */}
      <div className="col-12 col-md-4">
        <div className="card card-sm">
          <div className="card-body">
            <div className="text-muted">Net Change</div>

            <div
              key={`net-${period}`}
              className={`h2 m-0 fade-number ${changeColor}`}
            >
              {fmtSignedUsd(changeUsd)}
            </div>

            <div key={`netpct-${period}`} className="text-muted mt-1 fade-sub">
              ({fmtSignedPct(changePct)})
            </div>
          </div>
        </div>
      </div>

      {/* Vs BTC */}
      <div className="col-12 col-md-4">
        <div className="card card-sm">
          <div className="card-body">
            <div className="text-muted">Vs BTC</div>

            <div
              key={`vsbtc-${period}`}
              className={`h2 m-0 fade-number ${vsBtcColor}`}
            >
              {fmtSignedPct(vsBtcPp)}
            </div>

            <div
              key={`vsbtc-details-${period}`}
              className="text-muted mt-1 fade-sub"
            >
              (Portfolio: {fmtSignedPct(changePct)} · BTC: {fmtSignedPct(btcPct)})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
