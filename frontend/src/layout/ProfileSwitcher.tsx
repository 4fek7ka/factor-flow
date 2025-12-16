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

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          padding: "6px 10px",
          borderRadius: 10,
          background: "#0f172a",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        <img
          src={avatar}
          width={32}
          height={32}
          style={{ borderRadius: 999 }}
          alt=""
        />
        <span style={{ fontWeight: 600 }}>{selected.name}</span>
        <span style={{ opacity: 0.7 }}>▾</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: 6,
            background: "#0b1220",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            minWidth: 260,
            zIndex: 20,
          }}
        >
          {profiles.map((p) => {
            const icon = buildIdenticonDataUri(p.owner.address, {
              size: 28,
            });

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
                  background:
                    p.id === selectedId
                      ? "rgba(179,81,249,0.15)"
                      : "transparent",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <img
                  src={icon}
                  width={28}
                  height={28}
                  style={{ borderRadius: 999 }}
                  alt=""
                />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
