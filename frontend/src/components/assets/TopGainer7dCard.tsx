type Props = {
  name: string;
  symbol: string;
  image: string; // URL
  pct7d: number;
};

export function TopGainer7dCard({ name, symbol, image, pct7d }: Props) {
  const isUp = pct7d >= 0;
  const color = isUp ? "#4ADE80" : "#F87171";

  return (
    <div
      className="card card-sm mb-3 h-100"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "16px 20px",
      }}
    >
      {/* Заголовок */}
      <div
        className="text-muted"
        style={{
          fontSize: "0.9rem",
          marginBottom: 4, // ← ещё выше (было 6)
        }}
      >
        Top Gainer (7d)
      </div>

      {/* Центрированный основной блок */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* Плоский круглый контур с иконкой */}
          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: "999px",
              border: "1px solid rgba(148, 163, 184, 0.7)",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={image}
              alt={name}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Название + процент */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                color: "#e5e7eb",
                fontWeight: 600,
                fontSize: "1.1rem",
                letterSpacing: "0.04em",
              }}
            >
              {symbol.toUpperCase()}
            </span>

            <span
              style={{
                color,
                fontWeight: 700,
                fontSize: "1.5rem",
              }}
            >
              {isUp ? "+" : ""}
              {pct7d.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
