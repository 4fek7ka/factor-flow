
import type { HistoryPoint } from "../../services/portfolioService";

import { PortfolioAllocation } from "./PortfolioAllocation";
import { VolatilityArcCard } from "./VolatilityArcCard";

type Props = {
  history: HistoryPoint[];
};

export function PortfolioAllocationSection({ history }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: "24px",
        marginTop: "24px",
        alignItems: "stretch",
        width: "100%",
      }}
    >
      {/* LEFT – fixed 620px */}
      <div
        style={{
          width: "620px",
          flexShrink: 0,
          display: "flex",
        }}
      >
        <PortfolioAllocation history={history} />
      </div>

      {/* RIGHT – expands to fill all remaining space */}
      <div
        style={{
          flex: 1,
          display: "flex",
        }}
      >
        <VolatilityArcCard history={history} />
      </div>
    </div>
  );
}
