import { isValidDateRange } from "@/utils";
import { ChartAnalysis } from "@/utils/types";
import { validatedData } from "@/utils/validator";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  TooltipProps,
} from "recharts";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
import { z } from "zod";
import { ErrorComponent, AlertError } from "./alerts";
import { HistoryFullHeight } from "./layouts";

export default function HistoryChart({
  analyses,
  error,
  start,
  end,
}: Readonly<{
  analyses: ChartAnalysis[];
  error: Error | null;
  start: Date;
  end: Date;
}>) {
  if (error)
    return (
      <HistoryFullHeight>
        <div>
          <ErrorComponent error={error} />
        </div>
      </HistoryFullHeight>
    );

  if (!isValidDateRange(start, end))
    return (
      <div className="flex h-[var(--history-page-remaining-space)] items-center justify-center sm:h-[calc(100svh-12.5rem)]">
        <div>
          <AlertError message="Invalid Date Range" />
        </div>
      </div>
    );

  return (
    <div className="h-[var(--history-page-remaining-space)] min-h-[30rem] pr-4 sm:h-[var(--history-page-remaining-space-sm)]">
      <ResponsiveContainer width={"100%"} height={"100%"}>
        <LineChart
          width={300}
          height={100}
          data={analyses}
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <CartesianGrid strokeOpacity={0.25} />
          <Line
            dataKey="sentiment"
            type="monotone"
            stroke="#570df8"
            strokeWidth={2}
            activeDot={{ r: 8 }}
            dot={{ r: 4 }}
          />
          <XAxis
            dataKey="date"
            tickMargin={8}
            domain={[
              start.toLocaleDateString("en-us", {
                month: "short",
                day: "numeric",
              }),
              end.toLocaleDateString("en-us", {
                month: "short",
                day: "numeric",
              }),
            ]}
            tickFormatter={(label: string) =>
              new Date(label).toLocaleDateString("en-us", {
                month: "short",
                day: "numeric",
              })
            }
            minTickGap={16}
          />
          <YAxis dataKey="sentiment" domain={[-10, 10]} tickMargin={8} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} formatter={() => "Mood"} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomTooltip({ active, payload }: TooltipProps<ValueType, NameType>) {
  if (active && payload?.[0]?.payload) {
    const chartAnalysisSchema = z.object({
      sentiment: z.number(),
      date: z.date(),
      mood: z.string(),
      emoji: z.string(),
    });

    const { mood, date, emoji } = validatedData(
      chartAnalysisSchema,
      payload[0].payload,
    );

    return (
      <article className="prose rounded-lg bg-neutral px-4 py-2 text-neutral-content ">
        <h3 className="label mb-0 px-0 capitalize text-neutral-content">
          {mood} {emoji}
        </h3>
        <p className="pb-2 capitalize">
          {date.toLocaleDateString("en-us", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </article>
    );
  }

  return null;
}
