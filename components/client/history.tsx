"use client";

import { startOfWeek, endOfWeek } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DatePicker } from "@mui/x-date-pickers";
import { ChartAnalysis } from "@/utils/types";
import { getChartAnalyses, getMostRecentEntryDate } from "@/utils/actions";
import HistoryChart from "../server/chart";

export default function History({
  recentEntryDate,
  analyses,
}: Readonly<{
  recentEntryDate: string;
  analyses: ChartAnalysis[];
}>) {
  const [startDate, setStartDate] = useState(startOfWeek(recentEntryDate));
  const [endDate, setEndDate] = useState(endOfWeek(recentEntryDate));
  const [analysesState, setAnalysesState] = useState(analyses);
  const [error, setError] = useState<Error | null>(null);

  const recentEntryDateUpdate = useRecentEntryDate();
  const analysesUpdate = useAnalyses(startDate, endDate);

  const queryClient = useQueryClient();
  useEffect(() => {
    if (!recentEntryDateUpdate.data)
      queryClient.setQueryData(["most-recent"], recentEntryDate);

    if (!analysesUpdate.data)
      queryClient.setQueryData(
        ["analyses-period", { start: startDate, end: endDate }],
        analyses,
      );
  }, [
    analyses,
    analysesUpdate.data,
    recentEntryDate,
    recentEntryDateUpdate.data,
    queryClient,
    startDate,
    endDate,
  ]);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current && recentEntryDateUpdate.data) {
      firstRender.current = false;

      setStartDate(startOfWeek(recentEntryDateUpdate.data));
      setEndDate(endOfWeek(recentEntryDateUpdate.data));
    }
  }, [recentEntryDateUpdate.data]);

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

function useRecentEntryDate() {
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
