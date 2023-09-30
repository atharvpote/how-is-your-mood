import { TooltipProps } from "recharts";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
import { ChartAnalysis } from "./chart";

export default function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) {
  const dateLabel = new Date(label as string).toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  if (active && payload?.length) {
    const analysis = payload[0].payload as ChartAnalysis;

    return (
      <div className="rounded-lg border border-white/25 bg-neutral px-6 py-3 text-neutral-content shadow-md backdrop-blur dark:border-black/25">
        <p className="label text-sm">{dateLabel}</p>
        <p className="text-xl capitalize">
          {analysis.mood} {analysis.emoji}
        </p>
      </div>
    );
  }

  return null;
}
