import React from "react";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="page">
      {/* NAVBAR */}
      <header className="navbar navbar-expand-md d-print-none">
        <div className="container-xl">
          <h1 className="navbar-brand text-white m-0">
            Factor Flow
          </h1>
        </div>
      </header>

      {/* PAGE BODY */}
      <div className="page-wrapper">
        <div className="container-xl">
          <div className="row g-3 mt-3">
            {/* SIDEBAR */}
            <aside className="col-12 col-md-3 col-lg-2">
              <div className="list-group list-group-transparent">
                <a
                  href="#"
                  className="list-group-item list-group-item-action active"
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className="list-group-item list-group-item-action"
                >
                  Live Prices
                </a>
                <a
                  href="#"
                  className="list-group-item list-group-item-action"
                >
                  Price History
                </a>
                <a
                  href="#"
                  className="list-group-item list-group-item-action"
                >
                  Assets
                </a>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="col">
              <div className="page-body py-3">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
