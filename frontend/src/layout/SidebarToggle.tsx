import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

type Props = {
  expanded: boolean;
  onToggle: () => void;
};

export function SidebarToggle({ expanded, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: "100%",
        height: 38,
        border: "none",
        background: "transparent",
        color: "#9ca3af",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        paddingLeft: expanded ? 16 : 0,
      }}
      title="Toggle sidebar"
    >
      <div style={{ width: 28, textAlign: "center" }}>
        {expanded ? <IconChevronLeft size={20} /> : <IconChevronRight size={20} />}
      </div>

      {expanded && (
        <span style={{ fontSize: "14px", color: "#e5e7eb" }}>Collapse</span>
      )}
    </button>
  );
}
