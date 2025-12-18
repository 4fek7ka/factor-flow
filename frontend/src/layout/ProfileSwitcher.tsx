import { useEffect, useMemo, useRef, useState } from "react";
import portfoliosJson from "../data/mock-portfolios.json";
import { buildIdenticonDataUri } from "../utils/identicon";

type Profile = {
  id: string;
  name: string;
  owner: { name: string; address: string };
  assets: Record<string, number>;
};

type Props = {
  selectedId: string;
  onSelect: (id: string) => void;
};

const FONT_FAMILY =
  'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif';

export function ProfileSwitcher({ selectedId, onSelect }: Props) {
  const profiles = (portfoliosJson as any).profiles as Profile[];
  const selected = profiles.find((p) => p.id === selectedId) ?? profiles[0];

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const avatar = useMemo(
    () =>
      buildIdenticonDataUri(selected.owner.address, {
        size: 32,
      }),
    [selected.owner.address]
  );

  // фиксируем ширину имени по максимальному имени среди профилей
  const nameWidthPx = useMemo(() => {
    const names = (profiles ?? []).map((p) => (p?.name ?? "").trim());
    if (!names.length) return 120;

    const maxLen = Math.max(...names.map((n) => n.length), 8);
    const fallback = Math.ceil(maxLen * 8.2) + 2;

    if (typeof document === "undefined") return fallback;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return fallback;

    ctx.font = `600 14px ${FONT_FAMILY}`;

    let max = 0;
    for (const n of names) {
      max = Math.max(max, ctx.measureText(n).width);
    }

    return Math.ceil(max) + 2;
  }, [profiles]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* ================= BUTTON ================= */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          padding: "6px 10px",
          borderRadius: 10,

          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",

          cursor: "pointer",

          fontFamily: FONT_FAMILY,
          fontSize: 14,
          fontWeight: 600,
          lineHeight: "20px",
        }}
      >
        <img
          src={avatar}
          width={32}
          height={32}
          style={{ borderRadius: 999, flex: "0 0 auto" }}
          alt=""
        />

        <span
          style={{
            display: "inline-block",
            width: nameWidthPx,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={selected.name}
        >
          {selected.name}
        </span>

        <span
          style={{
            opacity: 0.7,
            flex: "0 0 auto",
            color: "var(--text-secondary)",
          }}
        >
          ▾
        </span>
      </button>

      {/* ================= DROPDOWN ================= */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: 6,

            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            minWidth: 260,

            zIndex: 20,
          }}
        >
          {profiles.map((p) => {
            const icon = buildIdenticonDataUri(p.owner.address, {
              size: 28,
            });

            const isActive = p.id === selectedId;

            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelect(p.id);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: "10px",
                  width: "100%",

                  background: isActive
                    ? "var(--primary-soft)"
                    : "transparent",

                  border: "none",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  textAlign: "left",

                  fontFamily: FONT_FAMILY,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <img
                  src={icon}
                  width={28}
                  height={28}
                  style={{ borderRadius: 999, flex: "0 0 auto" }}
                  alt=""
                />
                <span style={{ whiteSpace: "nowrap" }}>{p.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
