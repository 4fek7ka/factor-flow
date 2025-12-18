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
  const changeStyle =
    changeUsd >= 0
      ? { color: "var(--positive)" }
      : { color: "var(--negative)" };

  const vsBtcStyle =
    vsBtcPp >= 0
      ? { color: "var(--positive)" }
      : { color: "var(--negative)" };

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

        /* 🔧 Приводим карточки к нашей теме */
        .ff-card {
          background: var(--surface);
          border: 1px solid var(--border);
        }

        .ff-muted {
          color: var(--text-muted);
        }
      `}</style>

      {/* TVL */}
      <div className="col-12 col-md-4">
        <div className="card card-sm ff-card">
          <div className="card-body">
            <div className="ff-muted">TVL</div>

            <div className="h2 m-0" style={{ color: "var(--text-primary)" }}>
              {fmtUsd(tvl)}
            </div>

            <div className="ff-muted mt-1 fade-sub" key="asof">
              {lastTsMs
                ? `As of ${new Date(lastTsMs).toLocaleDateString("en-GB")}`
                : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Net Change */}
      <div className="col-12 col-md-4">
        <div className="card card-sm ff-card">
          <div className="card-body">
            <div className="ff-muted">Net Change</div>

            <div
              key={`net-${period}`}
              className="h2 m-0 fade-number"
              style={changeStyle}
            >
              {fmtSignedUsd(changeUsd)}
            </div>

            <div key={`netpct-${period}`} className="ff-muted mt-1 fade-sub">
              ({fmtSignedPct(changePct)})
            </div>
          </div>
        </div>
      </div>

      {/* Vs BTC */}
      <div className="col-12 col-md-4">
        <div className="card card-sm ff-card">
          <div className="card-body">
            <div className="ff-muted">Vs BTC</div>

            <div
              key={`vsbtc-${period}`}
              className="h2 m-0 fade-number"
              style={vsBtcStyle}
            >
              {fmtSignedPct(vsBtcPp)}
            </div>

            <div
              key={`vsbtc-details-${period}`}
              className="ff-muted mt-1 fade-sub"
            >
              (Portfolio: {fmtSignedPct(changePct)} · BTC:{" "}
              {fmtSignedPct(btcPct)})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
