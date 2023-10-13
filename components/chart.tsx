"use client";

import { useRef, useState } from "react";
import { Analysis } from "@prisma/client";
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
} from "recharts";
import { setTimeToMidnight } from "@/utils/client";
import ErrorComponent from "./error";
import CustomTooltip from "./tooltip";

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

  const startRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLInputElement | null>(null);

  const { data, error } = useAnalyses(start, end);

  if (error)
    return (
      <div className="grid h-[calc(100%-4rem)] place-content-center">
        <ErrorComponent error={error} />
      </div>
    );

  return (
    <>
      <div className="flex h-[calc(100%-4rem)] min-h-[25rem] flex-col">
        <div className="my-4 flex justify-center">
          <div className="flex flex-col gap-2">
            <div className="form-control">
              <div className="flex items-center gap-4">
                <span>From</span>
                <input
                  type="date"
                  className={`w-32 cursor-pointer rounded-lg bg-neutral p-2 text-center text-neutral-content focus:bg-neutral-focus ${
                    start.getTime() >= end.getTime()
                      ? "outline outline-error"
                      : ""
                  }`}
                  value={format(start, "yyyy-MM-dd")}
                  ref={startRef}
                  onClick={() => {
                    startRef.current?.showPicker();
                  }}
                  onFocus={() => {
                    startRef.current?.showPicker();
                  }}
                  onChange={({ target: { value } }) => {
                    setStart(setTimeToMidnight(new Date(value)));
                  }}
                />
                <span>To</span>
                <input
                  type="date"
                  className={`w-32 cursor-pointer rounded-lg bg-neutral p-2 text-center text-neutral-content focus:bg-neutral-focus ${
                    start.getTime() >= end.getTime()
                      ? "outline outline-error"
                      : ""
                  }`}
                  value={format(end, "yyyy-MM-dd")}
                  ref={endRef}
                  onClick={() => {
                    endRef.current?.showPicker();
                  }}
                  onFocus={() => {
                    endRef.current?.showPicker();
                  }}
                  onChange={({ target: { value } }) => {
                    setEnd(setTimeToMidnight(new Date(value)));
                  }}
                />
              </div>
              <label className="label cursor-pointer">
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
        <div className="flex basis-full items-center justify-center">
          {start.getTime() >= end.getTime() ? (
            <div>
              <div className="alert alert-error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Invalid Date Range</span>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width={"100%"} height={"100%"}>
              <LineChart
                width={300}
                height={100}
                data={selectAppropriateDataToUse(
                  data,
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
                  padding={{ left: 50 }}
                />
                <YAxis dataKey="sentiment" domain={[-10, 10]} />
                <Tooltip content={<CustomTooltip />} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
}

function selectAppropriateDataToUse(
  data: ChartAnalysis[] | undefined,
  allDays: boolean,
  start: Date,
  end: Date,
  analyses: ChartAnalysis[],
) {
  if (data) {
    if (allDays) return mapAnalyses(start, end, data);

    return data;
  } else {
    if (allDays) return mapAnalyses(start, end, analyses);

    return analyses;
  }
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
