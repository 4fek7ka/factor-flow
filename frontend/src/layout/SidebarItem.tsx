import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

type Props = {
  to: string;
  icon: ReactNode;
  label: string;
  expanded: boolean;
};

export function SidebarItem({ to, icon, label, expanded }: Props) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `nav-link d-flex align-items-center ${isActive ? "active" : ""}`
      }
      style={({ isActive }) => ({
        padding: "10px 12px",
        gap: "14px",
        color: isActive ? "#b351f9" : "#9ca3af",
        transition: "color 0.2s ease-in-out",
        whiteSpace: "nowrap",
      })}
      title={!expanded ? label : undefined}
    >
      {/* ICON — теперь тоже двигается чуть-чуть */}
      <div
        style={{
          width: 32,
          minWidth: 32,
          display: "flex",
          justifyContent: "center",
          transition: "transform 0.35s ease-in-out",
          transform: expanded ? "translateX(6px)" : "translateX(0px)",
        }}
      >
        {icon}
      </div>

      {/* LABEL — фирменная mask-анимация */}
      <span
        style={{
          fontSize: "15px",
          fontWeight: 500,
          opacity: expanded ? 1 : 0,
          transition:
            "opacity 0.25s ease-in-out, mask-image 0.35s ease-in-out, -webkit-mask-image 0.35s ease-in-out",

          maskImage: expanded
            ? "linear-gradient(90deg, black 100%, transparent 100%)"
            : "linear-gradient(90deg, black 0%, transparent 0%)",

          WebkitMaskImage: expanded
            ? "linear-gradient(90deg, black 100%, transparent 100%)"
            : "linear-gradient(90deg, black 0%, transparent 0%)",

          maskSize: "200% 100%",
          WebkitMaskSize: "200% 100%",

          overflow: "hidden",
          display: "inline-block",

          marginLeft: expanded ? "2px" : "-4px", // лёгкое движение текста
          transitionProperty: "opacity, margin-left, mask-image, -webkit-mask-image",
        }}
      >
        {label}
      </span>
    </NavLink>
  );
}
