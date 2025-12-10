import { SparklineBase } from "./SparklineBase";
type Props = {
  data: number[];
  positive: boolean;
};

export function AssetSparkline({ data, positive }: Props) {
  if (!data.length) return null;

  const color = positive ? "#22c55e" : "#ef4444";

  return (
    <SparklineBase
      values={data}
      color={color}
      width={100}
      height={34}
      strokeWidth={2}
    />
  );
}
