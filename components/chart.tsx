"use client";

import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import axios, { AxiosError } from "axios";
import {
  ResponsiveContainer,
  Line,
  LineChart,
  XAxis,
  Tooltip,
  YAxis,
  TooltipProps,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { z } from "zod";
import { HistoryDateRangeContext } from "@/contexts/history";
import { ChartAnalysis, formatErrors } from "@/utils";
import { AlertError, ErrorComponent } from "./alerts";
import { HistoryHeightFull } from "./layouts";

export default function HistoryChart({
  initialAnalyses,
}: {
  initialAnalyses: ChartAnalysis[];
}) {
  const historyDateRangeContext = useContext(HistoryDateRangeContext);

  if (historyDateRangeContext === null)
    throw new Error(
      "HistoryContext must be used within HistoryContextProvider",
    );

  const { setMostRecent, start, end } = historyDateRangeContext;

  const [analyses, setAnalyses] = useState(initialAnalyses);

  const { data: updatedRecent } = useMostRecent();
  const { data: updatedAnalyses, error } = useAnalyses(start, end);

  useEffect(() => {
    if (updatedRecent) {
      setMostRecent(updatedRecent);
    }

    if (updatedAnalyses) setAnalyses(updatedAnalyses);
  }, [setMostRecent, updatedAnalyses, updatedRecent]);

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
        <div className="flex h-[calc(100svh-26.75rem)] items-center justify-center sm:h-[calc(100svh-14.125rem)]">
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
              <Legend
                verticalAlign="top"
                height={36}
                formatter={() => "Mood"}
              />
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

function CustomTooltip({ active, payload }: TooltipProps<ValueType, NameType>) {
  if (active && payload?.length) {
    const data: unknown = payload[0].payload;

    const validation = z
      .object({
        sentiment: z.number(),
        date: z.date(),
        mood: z.string(),
        emoji: z.string(),
      })
      .safeParse(data);

    if (!validation.success) throw new Error(formatErrors(validation.error));

    const { mood, date, emoji } = validation.data;

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

function useAnalyses(start: Date, end: Date) {
  const params = new URLSearchParams({
    start: start.toISOString(),
    end: end.toISOString(),
  });

  return useSWR<ChartAnalysis[], AxiosError>({ start, end }, async () => {
    const {
      data: { analyses },
    } = await axios.get<{ analyses: ChartAnalysis[] }>(
      `/api/analysis?${params.toString()}`,
    );

    return analyses.map((analysis) => ({
      ...analysis,
      date: new Date(analysis.date),
    }));
  });
}

function isValidDateRange(start: Date, end: Date) {
  return start.getTime() >= end.getTime();
}
