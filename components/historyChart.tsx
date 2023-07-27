"use client";

import {
  ResponsiveContainer,
  Line,
  LineChart,
  XAxis,
  Tooltip,
  TooltipProps,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

interface ChartData {
  date: string;
  sentiment: number;
  mood: string;
  emoji: string;
}

export default function HistoryChart({ analyses }: { analyses: ChartData[] }) {
  return (
    <ResponsiveContainer width={"100%"} height={"100%"}>
      <LineChart
        width={300}
        height={100}
        data={analyses}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
      >
        <Line
          dataKey="sentiment"
          type="monotone"
          stroke="#1fb2a6"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis
          dataKey="date"
          tickFormatter={(label: string) =>
            `${new Date(label).toLocaleDateString("en-us", {
              month: "short",
              day: "numeric",
            })}`
          }
        />
        <YAxis dataKey="sentiment" />
        <Tooltip content={<CustomTooltip />} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function CustomTooltip({
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
    const analysis = payload[0].payload as ChartData;

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
