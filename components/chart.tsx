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
import { endOfWeek, startOfWeek } from "date-fns";
import { z } from "zod";
import { HistoryDateRangeContext } from "@/contexts/history";
import { deserializeDate, isValidDateRange } from "@/utils";
import { handleSWRError } from "@/utils/error";
import { ChartAnalysis, HistoryDateContextInterface } from "@/utils/types";
import { notNullValidator, zodSafeParseValidator } from "@/utils/validator";
import { AlertError, ErrorComponent } from "./alerts";
import { HistoryHeightFull } from "./layouts";

export default function HistoryChart({
  initialAnalyses,
}: Readonly<{
  initialAnalyses: ChartAnalysis[];
}>) {
  const historyDateRangeContext = useContext(HistoryDateRangeContext);

  notNullValidator<HistoryDateContextInterface>(
    historyDateRangeContext,
    "HistoryContext must be used within HistoryContextProvider",
  );

  const { start, end, setStart, setEnd } = historyDateRangeContext;

  const [analyses, setAnalyses] = useState(initialAnalyses);

  const { data: updatedMostRecent } = useMostRecent();
  const { data: updatedAnalyses, error } = useAnalyses(start, end);

  useEffect(() => {
    if (updatedMostRecent) {
      setStart(startOfWeek(updatedMostRecent));
      setEnd(endOfWeek(updatedMostRecent));
    }
  }, [setEnd, setStart, updatedMostRecent]);

  useEffect(() => {
    if (updatedAnalyses) {
      setAnalyses(updatedAnalyses);
    }
  }, [updatedAnalyses]);

  if (error) {
    return (
      <HistoryHeightFull>
        <div>
          <ErrorComponent error={error} />
        </div>
      </HistoryHeightFull>
    );
  }

  return (
    <>
      {isValidDateRange(start, end) ? (
        <div className="flex h-[var(--history-page-remaining-space)] items-center justify-center sm:h-[calc(100svh-12.5rem)]">
          <div>
            <AlertError message="Invalid Date Range" />
          </div>
        </div>
      ) : (
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

function CustomTooltip({ active, payload }: TooltipProps<ValueType, NameType>) {
  if (active && payload?.[0]?.payload) {
    const data: unknown = payload[0].payload;

    const validation = z
      .object({
        sentiment: z.number(),
        date: z.date(),
        mood: z.string(),
        emoji: z.string(),
      })
      .safeParse(data);

    const { mood, date, emoji } = zodSafeParseValidator(validation);

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

let firstLoad = true;

function useMostRecent() {
  return useSWR<(Date | null) | undefined, AxiosError>(
    "/api/analysis/most-recent",
    async (url: string) => {
      if (firstLoad) {
        firstLoad = false;

        return null;
      }

      try {
        const { data } = await axios.get<unknown>(url);

        const validation = z
          .object({
            mostRecent: z.union([z.null(), z.string()]),
          })
          .safeParse(data);

        const { mostRecent } = zodSafeParseValidator(validation);

        if (mostRecent === null) {
          return mostRecent;
        } else {
          new Date(mostRecent);
        }
      } catch (error) {
        handleSWRError(error);
      }
    },
  );
}

function useAnalyses(start: Date, end: Date) {
  const params = new URLSearchParams({
    start: start.toISOString(),
    end: end.toISOString(),
  });

  return useSWR<ChartAnalysis[] | undefined, AxiosError>(
    `/api/analysis?${params.toString()}`,
    async (url: string) => {
      if (firstLoad) {
        firstLoad = false;

        return undefined;
      }

      try {
        const { data } = await axios.get<unknown>(url);

        const validation = z
          .object({
            analyses: z
              .object({
                date: z.string(),
                emoji: z.string(),
                mood: z.string(),
                sentiment: z.number(),
              })
              .array(),
          })
          .safeParse(data);

        const { analyses } = zodSafeParseValidator(validation);

        return analyses.map(deserializeDate);
      } catch (error) {
        handleSWRError(error);
      }
    },
  );
}
