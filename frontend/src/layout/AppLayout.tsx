import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <div className="page">
      <Navbar />

      <div className="page-wrapper d-flex">
        <Sidebar />

        <main className="page-body" style={{ padding: "20px", width: "100%" }}>
          <div className="container-xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
