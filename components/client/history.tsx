"use client";

import { startOfWeek, endOfWeek } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import { ChartAnalysis } from "@/utils/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import HistoryChart from "../server/chart";
import { getChartAnalyses, getMostRecentEntryDate } from "@/utils/actions";

export default function History({
  mostRecentEntryDate,
  analyses,
}: Readonly<{
  mostRecentEntryDate: Date;
  analyses: ChartAnalysis[];
}>) {
  const [startDate, setStartDate] = useState(startOfWeek(mostRecentEntryDate));
  const [endDate, setEndDate] = useState(endOfWeek(mostRecentEntryDate));
  const [analysesState, setAnalysesState] = useState(analyses);
  const [error, setError] = useState<Error | null>(null);

  const mostRecentEntryDateUpdate = useMostRecentEntryDate();
  const analysesUpdate = useAnalyses(startDate, endDate);

  const queryClient = useQueryClient();

  if (!mostRecentEntryDateUpdate.data)
    queryClient.setQueryData(["most-recent"], mostRecentEntryDate);
  if (!analysesUpdate.data)
    queryClient.setQueryData(["analyses-period"], analyses);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current && mostRecentEntryDateUpdate.data) {
      firstRender.current = false;

      setStartDate(startOfWeek(mostRecentEntryDateUpdate.data));
      setEndDate(endOfWeek(mostRecentEntryDateUpdate.data));
    }
  }, [mostRecentEntryDateUpdate.data]);

  useEffect(() => {
    if (analysesUpdate.data) setAnalysesState(analysesUpdate.data);
  }, [analysesUpdate.data]);

  useEffect(() => {
    if (analysesUpdate.error) setError(analysesUpdate.error);
  }, [analysesUpdate.error]);

  return (
    <>
      <div className="flex justify-center py-4">
        <div className="flex flex-col gap-2">
          <div className="form-control">
            <div className="flex flex-col items-center gap-2 sm:flex-row">
              <span>From</span>
              <DatePicker
                value={startDate}
                onChange={(start) => {
                  if (start) setStartDate(start);
                }}
                format="dd/MM/yyyy"
              />
              <span>To</span>
              <DatePicker
                value={endDate}
                onChange={(end) => {
                  if (end) setEndDate(end);
                }}
                format="dd/MM/yyyy"
              />
            </div>
          </div>
        </div>
      </div>
      <HistoryChart
        analyses={analysesState}
        error={error}
        start={startDate}
        end={endDate}
      />
    </>
  );
}

function useMostRecentEntryDate() {
  return useQuery({
    queryKey: ["most-recent"],
    queryFn: async () => await getMostRecentEntryDate(),
  });
}

function useAnalyses(start: Date, end: Date) {
  return useQuery({
    queryKey: ["analyses-period", { start, end }],
    queryFn: async () => await getChartAnalyses(start, end),
  });
}
