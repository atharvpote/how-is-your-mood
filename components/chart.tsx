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
import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";
import { Journal } from "@prisma/client";
import { mapAnalyses } from "@/utils/client";
import { useAnalyses } from "@/utils/hooks";
import { LoadingSpinner } from "./loading";
import ErrorComponent from "./error";
import CustomTooltip from "./tooltip";

interface PropTypes {
  latestEntry: Journal;
}

export default function HistoryChart({ latestEntry }: PropTypes) {
  const weekStartDayOfLatestEntry = startOfWeek(latestEntry.date);
  const weekEndOfLatestEntry = endOfWeek(latestEntry.date);

  const [start, setStart] = useState(weekStartDayOfLatestEntry);
  const [end, setEnd] = useState(weekEndOfLatestEntry);
  const [allDays, setAllDays] = useState(false);

  const [date, setDate] = useState<DateValueType>({
    startDate: start,
    endDate: end,
  });

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
                <Datepicker
                  showShortcuts={true}
                  displayFormat={"DD/MM/YYYY"}
                  primaryColor={"teal"}
                  inputClassName="cursor-pointer w-full rounded-lg bg-base-200 text-base-content px-4 py-3 focus:bg-base-300"
                  configs={{
                    shortcuts: {
                      past: (period) => `Last ${period} days`,
                    },
                  }}
                  value={date}
                  onChange={(value: DateValueType) => {
                    const start = value?.startDate;
                    const end = value?.endDate;

                    if (start && end && start !== end) {
                      setStart(new Date(start));
                      setEnd(new Date(end));
                      setDate({ startDate: start, endDate: end });
                    }
                  }}
                />
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">
                      Include all days in between
                    </span>
                    <input
                      type="checkbox"
                      checked={allDays}
                      onClick={() => setAllDays(!allDays)}
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
