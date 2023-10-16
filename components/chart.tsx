"use client";

import { useRef, useState } from "react";
import useSWR from "swr";
import axios, { AxiosError } from "axios";
import { addDays, endOfWeek, format, startOfWeek } from "date-fns";
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
import { Analysis } from "@prisma/client";
import { setTimeToMidnight, showPicker } from "@/utils";
import { AlertError, ErrorComponent } from "./alerts";
import { HistoryHeightFull } from "./layouts";

interface PropTypes {
  mostRecent: Date;
  analyses: ChartAnalysis[];
}

export default function HistoryChart({ mostRecent, analyses }: PropTypes) {
  const [start, setStart] = useState(
    setTimeToMidnight(startOfWeek(mostRecent)),
  );
  const [end, setEnd] = useState(setTimeToMidnight(endOfWeek(mostRecent)));
  const [allDays, setAllDays] = useState(false);

  const { data: upstreamAnalysis, error } = useAnalyses(start, end);

  const startRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLInputElement | null>(null);

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
      <div className="flex justify-center py-4">
        <div className="flex flex-col gap-2">
          <div className="form-control">
            <div className="flex flex-col items-center gap-2 sm:flex-row">
              <span>From</span>
              <input
                type="date"
                className={`h-12 cursor-pointer rounded-lg bg-neutral p-2 text-center font-semibold text-neutral-content focus:bg-neutral-focus ${
                  isValidDateRange(start, end) ? "outline outline-error" : ""
                }`}
                value={format(start, "yyyy-MM-dd")}
                ref={startRef}
                onClick={showPicker(startRef)}
                onFocus={showPicker(startRef)}
                onChange={({ target: { value } }) => {
                  setStart(setTimeToMidnight(new Date(value)));
                }}
              />
              <span>To</span>
              <input
                type="date"
                className={`h-12 cursor-pointer rounded-lg bg-neutral p-2 text-center font-semibold text-neutral-content focus:bg-neutral-focus ${
                  isValidDateRange(start, end) ? "outline outline-error" : ""
                }`}
                value={format(end, "yyyy-MM-dd")}
                ref={endRef}
                onClick={showPicker(endRef)}
                onFocus={showPicker(endRef)}
                onChange={({ target: { value } }) => {
                  setEnd(setTimeToMidnight(new Date(value)));
                }}
              />
            </div>
            <label className="label flex cursor-pointer gap-2">
              <span className="label-text">Include all days in between</span>
              <input
                type="checkbox"
                checked={allDays}
                onChange={() => setAllDays(!allDays)}
                className="checkbox-primary checkbox"
              />
            </label>
          </div>
        </div>
      </div>
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
                data={selectAppropriateDataToUse(
                  upstreamAnalysis,
                  allDays,
                  start,
                  end,
                  analyses,
                )}
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
                  tickFormatter={(label: string) =>
                    `${new Date(label).toLocaleDateString("en-us", {
                      month: "short",
                      day: "numeric",
                    })}`
                  }
                />
                <YAxis dataKey="sentiment" domain={[-10, 10]} />
                <Tooltip content={<CustomTooltip />} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </>
    </>
  );
}

export type ChartAnalysis = Pick<
  Analysis,
  "sentiment" | "date" | "mood" | "emoji"
>;

function useAnalyses(start: Date, end: Date) {
  return useSWR<ChartAnalysis[], AxiosError>({ start, end }, async () => {
    const {
      data: { analyses },
    } = await axios.post<{ analyses: ChartAnalysis[] }>("/api/analysis/", {
      start,
      end,
    });

    return analyses;
  });
}

function isValidDateRange(start: Date, end: Date) {
  return start.getTime() >= end.getTime();
}

function selectAppropriateDataToUse(
  upstreamAnalysis: ChartAnalysis[] | undefined,
  allDays: boolean,
  start: Date,
  end: Date,
  analyses: ChartAnalysis[],
) {
  if (upstreamAnalysis) {
    if (allDays) return mapAnalyses(start, end, upstreamAnalysis);

    return upstreamAnalysis;
  } else {
    if (allDays) return mapAnalyses(start, end, analyses);

    return analyses;
  }
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
