"use client";

import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import axios, { AxiosError } from "axios";
import { addDays } from "date-fns";
import {
  ResponsiveContainer,
  Line,
  LineChart,
  XAxis,
  Tooltip,
  YAxis,
  TooltipProps,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { AlertError, ErrorComponent } from "./alerts";
import { HistoryHeightFull } from "./layouts";
import { useAnalyses } from "@/utils/hooks";
import { ChartAnalysis } from "@/utils/types";
import { HistoryDateRangeContext } from "@/contexts/history";

export default function HistoryChart({
  analyses: initialAnalyses,
}: {
  analyses: ChartAnalysis[];
}) {
  const historyDateRangeContext = useContext(HistoryDateRangeContext);

  if (historyDateRangeContext === null)
    throw new Error(
      "HistoryContext must be used within HistoryContextProvider",
    );

  const { setRecent, start, end, showAllDates } = historyDateRangeContext;

  const [analyses, setAnalyses] = useState(initialAnalyses);

  const { data: updatedRecent } = useMostRecent();
  const { data: updatedAnalyses, error } = useAnalyses(start, end);

  useEffect(() => {
    if (updatedRecent) {
      setRecent(updatedRecent);
    }

    if (updatedAnalyses) setAnalyses(updatedAnalyses);
  }, [setRecent, updatedAnalyses, updatedRecent]);

  if (error)
    return (
      <HistoryHeightFull>
        <div>
          <ErrorComponent error={error} />
        </div>
      </HistoryHeightFull>
    );

  return (
    <>
      {isValidDateRange(start, end) ? (
        <div className="flex h-[calc(100vh-26.75rem)] items-center justify-center sm:h-[calc(100vh-14.125rem)]">
          <div>
            <AlertError error="Invalid Date Range" />
          </div>
        </div>
      ) : (
        <div className="h-screen">
          <ResponsiveContainer width={"100%"} height={"100%"}>
            <LineChart
              width={300}
              height={100}
              data={showAllDates ? mapAnalyses(start, end, analyses) : analyses}
              margin={{ top: 12, right: 50, bottom: 0, left: 0 }}
            >
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
                tickFormatter={(label: string) => {
                  return `${new Date(label).toLocaleDateString("en-us", {
                    month: "short",
                    day: "numeric",
                  })}`;
                }}
              />
              <YAxis dataKey="sentiment" domain={[-10, 10]} />
              <Tooltip content={<CustomTooltip />} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}

function useMostRecent() {
  return useSWR<Date | undefined, AxiosError>(
    "/api/analysis/most-recent",
    async (key: string) => {
      const {
        data: { mostRecent },
      } = await axios.get<{ mostRecent?: Date }>(key);

      return mostRecent ? new Date(mostRecent) : mostRecent;
    },
  );
}

function isValidDateRange(start: Date, end: Date) {
  return start.getTime() >= end.getTime();
}

function mapAnalyses(start: Date, end: Date, analyses: ChartAnalysis[]) {
  const range: Date[] = [];
  let current = start;

  while (current <= end) {
    range.push(current);

    current = addDays(current, 1);
  }

  return range.map((date) => {
    const analysis = analyses.find(
      (analysis) =>
        new Date(analysis.date).toDateString() === date.toDateString(),
    );

    if (analysis) return analysis;

    return { date };
  });
}

function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) {
  const dateLabel = new Date(label as string).toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  if (active && payload?.length) {
    const analysis = payload[0].payload as ChartAnalysis;

    return (
      <article className="prose rounded-lg border border-white/25 bg-neutral px-4 py-2 text-neutral-content shadow-md backdrop-blur dark:border-black/25">
        <h3 className="label mb-0 px-0 text-neutral-content">{dateLabel}</h3>
        <p className="pb-2 capitalize">
          {analysis.mood} {analysis.emoji}
        </p>
      </article>
    );
  }

  return null;
}
