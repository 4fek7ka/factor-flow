import type { FC } from "react";

type Props = {
  btc: number; // BTC dominance %
  eth: number; // ETH dominance %
  alt: number; // ALT dominance %
};

export const BtcEthAltCard: FC<Props> = ({ btc, eth, alt }) => {
  const btcPct = btc.toFixed(1);
  const ethPct = eth.toFixed(1);
  const altPct = alt.toFixed(1);

  const btcColor = "#fbbf24";  // amber-400
  const ethColor = "#c084fc";  // violet-400 (нежный фиолетовый)
  const altColor = "#475569";  // slate-700

  return (
    <div
      className="card card-sm mb-3 h-100"
      style={{
        flex: 1,
      }}
    >
      <div
        className="card-body"
        style={{
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Заголовок */}
        <div className="text-muted">Market Dominance</div>

        {/* Горизонтальная полоса */}
        <div
          style={{
            width: "100%",
            height: 12, // ← было 18, теперь тоньше
            borderRadius: 10,
            overflow: "hidden",
            display: "flex",
          }}
        >
          {/* BTC */}
          <div
            style={{
              width: `${btc}%`,
              backgroundColor: btcColor,
              transition: "width 0.3s ease",
            }}
          />

          {/* ETH */}
          <div
            style={{
              width: `${eth}%`,
              backgroundColor: ethColor,
              transition: "width 0.3s ease",
            }}
          />

          {/* ALT */}
          <div
            style={{
              width: `${alt}%`,
              backgroundColor: altColor,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Подписи */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 14,
            marginTop: 4,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ color: btcColor, fontWeight: 600 }}>BTC</span>
            <span style={{ color: ethColor, fontWeight: 600 }}>ETH</span>
            <span style={{ color: altColor, fontWeight: 600 }}>ALT</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ color: btcColor, fontWeight: 600 }}>{btcPct}%</span>
            <span style={{ color: ethColor, fontWeight: 600 }}>{ethPct}%</span>
            <span style={{ color: altColor, fontWeight: 600 }}>{altPct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
