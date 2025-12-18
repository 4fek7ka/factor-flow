import { NavLink } from "react-router-dom";

export function Navbar() {
  return (
    <header
      className="navbar navbar-expand-md navbar-dark"
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="container-xl d-flex justify-content-between">
        {/* LOGO */}
        <NavLink
          to="/"
          className="navbar-brand"
          style={{
            fontWeight: 600,
            fontSize: 20,
            color: "var(--text-primary)",
          }}
        >
          Factor Flow
        </NavLink>

        {/* NAVIGATION */}
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
          color: isActive
            ? "var(--primary)"
            : "var(--text-secondary)",
          fontWeight: isActive ? 600 : 400,
          transition: "color 0.2s ease-in-out",
        })}
      >
        {label}
      </NavLink>
    </li>
  );
}
