import { TooltipProps } from "recharts";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
import { Analysis } from "@prisma/client";

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
    const analysis = payload[0].payload as Analysis;

    return (
      <div className="rounded-lg border border-white/25 bg-base-200/25 px-6 py-3 shadow-md backdrop-blur dark:border-black/25">
        <p className="label text-sm text-accent">{dateLabel}</p>
        <p className="text-xl capitalize">
          {analysis.mood} {String.fromCodePoint(Number(analysis.emoji))}
        </p>
      </div>
    );
  }

  return null;
}
