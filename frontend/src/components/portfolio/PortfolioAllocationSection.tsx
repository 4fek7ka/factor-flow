import type {
  AssetAmounts,
  HistoryPoint,
} from "../../services/portfolio/portfolioService";

import { PortfolioAllocation } from "./PortfolioAllocation";
import { VolatilityArcCard } from "./VolatilityArcCard";

type Props = {
  history: HistoryPoint[];
  amounts: AssetAmounts;
};

export function PortfolioAllocationSection({ history, amounts }: Props) {
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
      <div
        style={{
          width: "620px",
          flexShrink: 0,
          display: "flex",
        }}
      >
        <PortfolioAllocation history={history} amounts={amounts} />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
        }}
      >
        <VolatilityArcCard history={history} amounts={amounts} />
      </div>
    </div>
  );
}
