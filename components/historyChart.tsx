"use client";

import { useAnalysis } from "@/utils/client";
import { Analysis } from "@prisma/client";
import { getWeek } from "date-fns";
import { useRef, useState } from "react";
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

export default function HistoryChart() {
  const today = new Date();

  const [month, setMonth] = useState(today);
  const { data, error, isLoading } = useAnalysis(month);
  const dateRef = useRef<HTMLInputElement>(null);

  const analyses = data?.map((analysis) => ({
    date: new Date(analysis.date).toLocaleDateString("en-in", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    sentiment: analysis.sentiment,
    mood: analysis.mood,
    emoji: analysis.emoji,
  }));

  return (
    <>
      <div className="flex h-[calc(100vh-7.5rem)] min-h-[25rem] justify-center">
        <ResponsiveContainer width={"90%"} height={"100%"}>
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
      </div>
    </>
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
