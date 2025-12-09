import { NavLink } from "react-router-dom";

export function Sidebar() {
  return (
    <aside
      className="navbar navbar-vertical navbar-expand-lg"
      style={{ width: "240px" }}
    >
      <div className="container-fluid">
        <ul className="navbar-nav pt-lg-3">
          <li className="nav-item">
            <NavLink to="/" end className="nav-link">
              <span className="nav-link-title">Dashboard</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/prices" className="nav-link">
              <span className="nav-link-title">Live Prices</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/assets" className="nav-link">
              <span className="nav-link-title">Assets</span>
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/settings" className="nav-link">
              <span className="nav-link-title">Settings</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
}
