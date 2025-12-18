import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { ProfileSwitcher } from "./ProfileSwitcher";

export function AppLayout() {
  const [profileId, setProfileId] = useState("conservative");

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg)",
      }}
    >
      {/* фикс скачка из-за scrollbar */}
      <style>{`
        html { scrollbar-gutter: stable; }
        body { overflow-y: scroll; }
      `}</style>

      <Sidebar />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* ================= HEADER ================= */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            height: 56,
            display: "flex",
            alignItems: "center",
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            padding: "0 125px",
          }}
        >
          {/* LEFT: LOGO + TITLE */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              whiteSpace: "nowrap",
            }}
          >
            <img
              src="/favicon.png"
              alt="Factor Flow"
              style={{
                width: 40,
                height: 40,
                objectFit: "contain",
              }}
            />

            {/* TITLE */}
            <span
              style={{
                fontWeight: 600,
                fontSize: 23,
                display: "flex",
                alignItems: "baseline",
              }}
            >
              {/* Factor — blue */}
              <span
                style={{
                  color: "#38bdf8", // blue / sky
                }}
              >
                Factor
              </span>
              &nbsp;
              {/* Flow — violet */}
              <span
                style={{
                  color: "#a78bfa", // violet
                }}
              >
                Flow
              </span>
            </span>
          </div>

          {/* RIGHT */}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ProfileSwitcher
              selectedId={profileId}
              onSelect={setProfileId}
            />
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <main
          style={{
            padding: 24,
            background: "var(--bg)",
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              width: "100%",
            }}
          >
            <Outlet context={{ profileId }} />
          </div>
        </main>
      </div>
    </div>
  );
}
