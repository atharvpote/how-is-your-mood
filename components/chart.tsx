"use client";

import { mapAnalyses } from "@/utils/client";
import { Journal } from "@prisma/client";
import { endOfWeek, startOfWeek } from "date-fns";
import { useState } from "react";
import {
  ResponsiveContainer,
  Line,
  LineChart,
  XAxis,
  Tooltip,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TopLoadingSpinner } from "./loading";
import ErrorComponent from "./error";
import { useAnalyses } from "@/utils/hooks";
import CustomTooltip from "./tooltip";
import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";

export default function HistoryChart({ entry }: { entry: Journal }) {
  const weekStartDayOfLatestEntry = startOfWeek(entry.date);
  const weekEndOfLatestEntry = endOfWeek(entry.date);

  const [start, setStart] = useState(weekStartDayOfLatestEntry);
  const [end, setEnd] = useState(weekEndOfLatestEntry);

  const [date, setDate] = useState<DateValueType>({
    startDate: start,
    endDate: end,
  });

  const { data, error, isLoading } = useAnalyses(start, end);

  if (isLoading) return <TopLoadingSpinner />;
  if (error) return <ErrorComponent error={error} />;

  return (
    <>
      <div className="flex h-[calc(100%-4rem)] min-h-[25rem] flex-col">
        {data?.length ? (
          <>
            <div className="my-4 flex flex-auto justify-center">
              <div className="basis-72">
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

                    if (start && end) {
                      setStart(new Date(start));
                      setEnd(new Date(end));
                      setDate({ startDate: start, endDate: end });
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex basis-full justify-center">
              <ResponsiveContainer width={"100%"} height={"100%"}>
                <LineChart
                  width={300}
                  height={100}
                  data={mapAnalyses(start, end, data)}
                  margin={{ top: 0, right: 50, bottom: 0, left: 0 }}
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
