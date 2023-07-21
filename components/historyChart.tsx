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
  Date: Date;
  Sentiment: number;
  Mood: string;
  Emoji: string;
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
          dataKey="Sentiment"
          type="monotone"
          stroke="#8884d8"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis dataKey="Date" />
        <YAxis dataKey="Sentiment" />
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
    hour: "numeric",
    minute: "numeric",
  });

  if (active && payload?.length) {
    const analysis = payload[0].payload as ChartData;

    return (
      <div className="relative rounded-lg border border-black/10 bg-white/5 p-8 shadow-md backdrop-blur-md">
        <p className="label text-sm text-black/30">{dateLabel}</p>
        <p className="text-xl uppercase">
          {analysis.Mood} {String.fromCodePoint(Number(analysis.Emoji))}
        </p>
      </div>
    );
  }

  return null;
}
