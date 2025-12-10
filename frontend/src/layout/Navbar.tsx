import { NavLink } from "react-router-dom";

export function Navbar() {
  return (
    <header
      className="navbar navbar-expand-md navbar-dark"
      style={{
        background: "#111827",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="container-xl d-flex justify-content-between">
        {/* ЛОГО */}
        <NavLink
          to="/"
          className="navbar-brand"
          style={{
            fontWeight: 600,
            fontSize: "20px",
          }}
        >
          Factor Flow
        </NavLink>

        {/* НАВИГАЦИЯ */}
        <ul className="navbar-nav flex-row">
          <NavItem to="/" label="Dashboard" />
          <NavItem to="/prices" label="Prices" />
          <NavItem to="/assets" label="Assets" />
          <NavItem to="/settings" label="Settings" />
        </ul>
      </div>
    </header>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <li className="nav-item mx-2">
      <NavLink
        to={to}
        end
        className={({ isActive }) =>
          "nav-link px-3" + (isActive ? " active" : "")
        }
        style={({ isActive }) => ({
          color: isActive ? "#b351f9" : "#d1d5db",
          fontWeight: isActive ? 600 : 400,
        })}
      >
        {label}
      </NavLink>
    </li>
  );
}
