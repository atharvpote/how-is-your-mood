"use client";

import { startOfWeek, endOfWeek } from "date-fns";
import { useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import { ChartAnalysis } from "@/utils/types";
import { deserializeDate, isValidDateRange } from "@/utils";
import { handleAxiosError } from "@/utils/error";
import { zodSafeParseValidator } from "@/utils/validator";
import { useQuery } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { z } from "zod";
import { AlertError, ErrorComponent } from "./alerts";
import { HistoryHeightFull } from "./layouts";
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

export default function History({
  initialMostRecent,
  initialAnalyses,
}: Readonly<{
  initialMostRecent: Date;
  initialAnalyses: ChartAnalysis[];
}>) {
  const [start, setStart] = useState(startOfWeek(initialMostRecent));
  const [end, setEnd] = useState(endOfWeek(initialMostRecent));
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
    if (updatedAnalyses) setAnalyses(updatedAnalyses);
  }, [updatedAnalyses]);

  return (
    <>
      <div className="flex justify-center py-4">
        <div className="flex flex-col gap-2">
          <div className="form-control">
            <div className="flex flex-col items-center gap-2 sm:flex-row">
              <span>From</span>
              <DatePicker
                value={start}
                onChange={(start) => {
                  if (start) setStart(start);
                }}
                format="dd/MM/yyyy"
              />
              <span>To</span>
              <DatePicker
                value={end}
                onChange={(end) => {
                  if (end) setEnd(end);
                }}
                format="dd/MM/yyyy"
              />
            </div>
          </div>
        </div>
      </div>
      <HistoryChart analyses={analyses} error={error} start={start} end={end} />
    </>
  );
}

function HistoryChart({
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
      <HistoryHeightFull>
        <div>
          <ErrorComponent error={error} />
        </div>
      </HistoryHeightFull>
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
    const { mood, date, emoji } = zodSafeParseValidator(
      z
        .object({
          sentiment: z.number(),
          date: z.date(),
          mood: z.string(),
          emoji: z.string(),
        })
        .safeParse(payload[0].payload),
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

let useInitialMostRecent = true;

function useMostRecent() {
  return useQuery({
    queryKey: ["most-recent"],
    queryFn: async () => {
      if (useInitialMostRecent) {
        useInitialMostRecent = false;

        return null;
      }

      try {
        const { data } = await axios.get<unknown>("/api/analysis/most-recent");

        const { mostRecent } = zodSafeParseValidator(
          z
            .object({
              mostRecent: z.union([z.null(), z.string()]),
            })
            .safeParse(data),
        );

        return mostRecent === null ? mostRecent : new Date(mostRecent);
      } catch (error) {
        if (isAxiosError(error)) handleAxiosError(error);
        else throw new Error(`Unknown Error: ${Object(error)}`);
      }
    },
  });
}

let useInitialAnalyses = true;

function useAnalyses(start: Date, end: Date) {
  return useQuery({
    queryKey: ["analyses-period", { start, end }],
    queryFn: async () => {
      if (useInitialAnalyses) {
        useInitialAnalyses = false;

        return null;
      }

      try {
        const { data } = await axios.get<unknown>(
          `/api/analysis?${new URLSearchParams({
            start: start.toISOString(),
            end: end.toISOString(),
          }).toString()}`,
        );

        const { analyses } = zodSafeParseValidator(
          z
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
            .safeParse(data),
        );

        return analyses.map(deserializeDate);
      } catch (error) {
        if (isAxiosError(error)) handleAxiosError(error);
        else throw new Error(`Unknown Error: ${Object(error)}`);
      }
    },
  });
}
