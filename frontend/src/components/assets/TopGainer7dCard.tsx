type Props = {
  name: string;
  symbol: string;
  image?: string | null;
  pct7d: number;
};

export function TopGainer7dCard({ name, symbol, image, pct7d }: Props) {
  const isUp = pct7d >= 0;

  // ✅ цвета как раньше: зелёный / красный
  const pctColor = isUp ? "var(--positive)" : "var(--negative)";

  return (
    <div
      className="card card-sm mb-3 h-100"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "16px 20px",
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Заголовок */}
      <div
        style={{
          fontSize: "0.85rem",
          color: "var(--text-muted)",
          marginBottom: 4,
        }}
      >
        Top Gainer (7d)
      </div>

      {/* Центрированный контент */}
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
          {/* Иконка */}
          {image ? (
            <div
              style={{
                width: 66,
                height: 66,
                borderRadius: "999px",
                border: "1px solid var(--border)",
                background: "var(--surface-hover)",
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
          ) : null}

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
                color: "var(--text-primary)",
                fontWeight: 600,
                fontSize: "1.05rem",
                letterSpacing: "0.04em",
              }}
            >
              {symbol.toUpperCase()}
            </span>

            <span
              style={{
                color: pctColor,
                fontWeight: 700,
                fontSize: "1.45rem",
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
