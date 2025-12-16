import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { ProfileSwitcher } from "./ProfileSwitcher";

export function AppLayout() {
  const [profileId, setProfileId] = useState("conservative");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#070B17" }}>
      <Sidebar />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* ================= HEADER (STICKY) ================= */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            background: "#111827",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ fontWeight: 600, color: "#fff" }}>Factor Flow</div>

          <ProfileSwitcher
            selectedId={profileId}
            onSelect={setProfileId}
          />
        </header>

        {/* ================= CONTENT ================= */}
        <main style={{ padding: 24 }}>
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
