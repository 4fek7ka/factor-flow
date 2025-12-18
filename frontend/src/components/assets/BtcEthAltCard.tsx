import type { FC } from "react";

type Props = {
  btc: number;
  eth: number;
  alt: number;
};

export const BtcEthAltCard: FC<Props> = ({ btc, eth, alt }) => {
  const btcPct = btc.toFixed(1);
  const ethPct = eth.toFixed(1);
  const altPct = alt.toFixed(1);

  // 🎨 Цвета под общую тему
  const btcColor = "#F59E0B"; // BTC — оранжевый
  const ethColor = "#8B5CF6"; // ETH — фиолетовый
  const altColor = "#64748B"; // ALT — нейтральный

  return (
    <div
      className="card card-sm mb-3 h-100"
      style={{
        flex: 1,
        backgroundColor: "var(--surface)", // ✅ без градиента
        border: "1px solid var(--border)",
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
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Market Dominance
        </div>

        {/* Полоса */}
        <div
          style={{
            width: "100%",
            height: 12,
            borderRadius: 10,
            overflow: "hidden",
            display: "flex",
            background: "var(--surface-hover)",
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ width: `${btc}%`, backgroundColor: btcColor }} />
          <div style={{ width: `${eth}%`, backgroundColor: ethColor }} />
          <div style={{ width: `${alt}%`, backgroundColor: altColor }} />
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
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {btcPct}%
            </span>
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {ethPct}%
            </span>
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {altPct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
