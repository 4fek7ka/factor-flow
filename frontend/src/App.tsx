import { PortfolioSection } from "./components/PortfolioSection";

export default function App() {
  return (
    <div className="page">
      {/* NAVBAR */}
      <header className="navbar navbar-expand-md d-print-none">
        <div className="container-xl">
          <h1 className="navbar-brand text-white m-0">Factor Flow</h1>
        </div>
      </header>

      {/* PAGE WRAPPER */}
      <div className="page-wrapper d-flex">
        {/* SIDEBAR */}
        <aside
          className="navbar navbar-vertical navbar-expand-lg"
          style={{ width: "240px" }}
        >
          <div className="container-fluid">
            <ul className="navbar-nav pt-lg-3">
              <li className="nav-item">
                <a className="nav-link active" href="#">
                  <span className="nav-link-title">Dashboard</span>
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#">
                  <span className="nav-link-title">Live Prices</span>
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#">
                  <span className="nav-link-title">Price History</span>
                </a>
              </li>
            </ul>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="page-body" style={{ padding: "20px", width: "100%" }}>
          <div className="container-xl">
            {/* PAGE HEADER */}
            <div className="page-header mb-3">
              <h2 className="page-title">Dashboard</h2>
              <div className="text-muted">Аналитика портфеля</div>
            </div>

            {/* ✅ Секция сама содержит: метрики сверху + карточку графика снизу */}
            <PortfolioSection />
          </div>
        </main>
      </div>
    </div>
  );
}
