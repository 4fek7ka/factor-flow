import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        background: "#020617",
        color: "#e5e7eb",
        overflow: "hidden",
      }}
    >
      {/* Левый сайдбар */}
      <Sidebar />

      {/* Правая часть: navbar + контент */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* TOP NAVBAR */}
        <header
          style={{
            height: 56,
            flexShrink: 0,
            borderBottom: "1px solid rgba(148,163,184,0.2)",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            background: "#020617",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1280,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: 0.3,
              }}
            >
              Factor Flow
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1280,
              margin: "0 auto",
              padding: "20px 24px 32px",
            }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
