"use client";

import { useState } from "react";
import { endOfWeek, startOfWeek } from "date-fns";
import {
  ResponsiveContainer,
  Line,
  LineChart,
  XAxis,
  Tooltip,
  YAxis,
  CartesianGrid,
} from "recharts";
import DatePicker from "react-datepicker";
import { Journal } from "@prisma/client";
import { mapAnalyses } from "@/utils/client";
import { useAnalyses } from "@/utils/hooks";
import { LoadingSpinner } from "./loading";
import ErrorComponent from "./error";
import CustomTooltip from "./tooltip";

import "react-datepicker/dist/react-datepicker.css";
import "@/style/datePicker.css";

interface PropTypes {
  mostRecentEntry: Journal;
}

export default function HistoryChart({ mostRecentEntry }: PropTypes) {
  const weekStartDayOfLatestEntry = startOfWeek(mostRecentEntry.date);
  const weekEndOfLatestEntry = endOfWeek(mostRecentEntry.date);

  const [start, setStart] = useState(weekStartDayOfLatestEntry);
  const [end, setEnd] = useState(weekEndOfLatestEntry);
  const [allDays, setAllDays] = useState(false);

  const { data, error, isLoading } = useAnalyses(start, end);

  if (isLoading)
    return (
      <div className="grid h-[calc(100%-4rem)] place-content-center">
        <LoadingSpinner />
      </div>
    );

  if (error)
    return (
      <div className="grid h-[calc(100%-4rem)] place-content-center">
        <ErrorComponent error={error} />
      </div>
    );

  return (
    <>
      <div className="flex h-[calc(100%-4rem)] min-h-[25rem] flex-col">
        {data?.length ? (
          <>
            <div className="my-4 flex justify-center">
              <div className="flex flex-col gap-2">
                <div className="form-control">
                  <div className="flex items-center gap-4">
                    <span>From</span>
                    <DatePicker
                      selected={start}
                      onChange={(date) => {
                        if (date) setStart(date);
                      }}
                      selectsStart
                      startDate={start}
                      endDate={end}
                      dateFormat="dd/MM/yyyy"
                      className="w-32 cursor-pointer rounded-lg bg-base-200 p-3"
                    />
                    <span>To</span>
                    <DatePicker
                      selected={end}
                      onChange={(date) => {
                        if (date) setEnd(date);
                      }}
                      selectsEnd
                      startDate={start}
                      endDate={end}
                      minDate={start}
                      dateFormat="dd/MM/yyyy"
                      className="w-32 cursor-pointer rounded-lg bg-base-200 p-3"
                    />
                  </div>
                  <label className="label cursor-pointer">
                    <span className="label-text">
                      Include all days in between
                    </span>
                    <input
                      type="checkbox"
                      checked={allDays}
                      onChange={() => setAllDays(!allDays)}
                      className="checkbox-accent checkbox"
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex basis-full justify-center">
              <ResponsiveContainer width={"100%"} height={"100%"}>
                <LineChart
                  width={300}
                  height={100}
                  data={allDays ? mapAnalyses(start, end, data) : data}
                  margin={{ top: 0, right: 50, bottom: 0, left: 0 }}
                >
                  <Line
                    dataKey="sentiment"
                    type="monotone"
                    stroke="#1fb2a6"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    dot={{ r: 4 }}
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
                    padding={{ left: 50 }}
                  />
                  <YAxis dataKey="sentiment" domain={[-10, 10]} />
                  <Tooltip content={<CustomTooltip />} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div></div>
        )}
      </div>
    </>
  );
}
