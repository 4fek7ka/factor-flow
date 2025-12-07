import { PriceChart } from "./components/PriceChart";

export default function App() {
  return (
    <div className="page">
      {/* NAVBAR */}
      <header className="navbar navbar-expand-md d-print-none">
        <div className="container-xl">
          <h1 className="navbar-brand">Factor Flow</h1>
        </div>
      </header>

      <div className="page-wrapper d-flex">
        {/* SIDEBAR */}
        <aside className="navbar navbar-vertical navbar-expand-lg" style={{ width: "240px" }}>
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

              <li className="nav-item">
                <a className="nav-link" href="#">
                  <span className="nav-link-title">Assets</span>
                </a>
              </li>
            </ul>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="page-body" style={{ padding: "20px", width: "100%" }}>
          <div className="container-xl">

            {/* Заголовок страницы */}
            <div className="page-header mb-3">
              <h2 className="page-title">Dashboard</h2>
              <div className="text-muted">Здесь будет аналитика.</div>
            </div>

            {/* Карточка с графиком */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title mb-0">Price Chart</h3>
              </div>
              <div className="card-body">
                <PriceChart />
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
