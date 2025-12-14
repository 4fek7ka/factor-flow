// src/layout/Sidebar.tsx

import { useState } from "react";
import { SidebarItem } from "./SidebarItem";
import {
  IconLayoutDashboard,
  IconChartLine,
  IconTable,
  IconSettings,
  IconChartDots,
} from "@tabler/icons-react";

export function Sidebar() {
  const [expanded, setExpanded] = useState(false);

  const WIDTH_COLLAPSED = 70;
  const WIDTH_EXPANDED = 220;

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        width: expanded ? WIDTH_EXPANDED : WIDTH_COLLAPSED,
        transition: "width 0.35s ease-in-out",
        background: "#111827",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        paddingTop: "20px",
        height: "calc(100vh - 55px)",
        position: "fixed",
        top: 55,
        left: 0,
        overflow: "hidden",
        zIndex: 20,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", marginTop: 10 }}>
        <SidebarItem
          to="/"
          label="Dashboard"
          icon={<IconLayoutDashboard size={22} />}
          expanded={expanded}
        />
        <SidebarItem
          to="/assets"
          label="Assets"
          icon={<IconTable size={22} />}
          expanded={expanded}
        />

        {/* ➜ Новый пункт меню Simulation */}
        <SidebarItem
          to="/simulation"
          label="Simulation"
          icon={<IconChartDots size={22} />}
          expanded={expanded}
        />

       
      </div>
    </aside>
  );
}
