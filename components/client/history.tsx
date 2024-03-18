"use client";

import { startOfWeek, endOfWeek } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DatePicker } from "@mui/x-date-pickers";
import { JournalAnalysisChart } from "@/utils/types";
import { getChartAnalyses, getMostRecentJournalEntry } from "@/utils/actions";
import HistoryChart from "../server/chart";

export default function History({
  mostRecentEntryDate,
  analyses,
}: Readonly<{
  mostRecentEntryDate: Date;
  analyses: JournalAnalysisChart[];
}>) {
  const [startDate, setStartDate] = useState(startOfWeek(mostRecentEntryDate));
  const [endDate, setEndDate] = useState(endOfWeek(mostRecentEntryDate));
  const [analysesState, setAnalysesState] = useState(analyses);
  const [error, setError] = useState<Error | null>(null);

  const mostRecentEntryUpdate = useMostRecentEntry();
  const analysesUpdate = useAnalyses(startDate, endDate);

  const queryClient = useQueryClient();
  useEffect(() => {
    if (!mostRecentEntryUpdate.data)
      queryClient.setQueryData(["most-recent"], mostRecentEntryDate);

    if (!analysesUpdate.data)
      queryClient.setQueryData(
        ["analyses-period", { start: startDate, end: endDate }],
        analyses,
      );
  }, [
    analyses,
    analysesUpdate.data,
    mostRecentEntryDate,
    mostRecentEntryUpdate.data,
    queryClient,
    startDate,
    endDate,
  ]);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current && mostRecentEntryUpdate.data?.date) {
      firstRender.current = false;

      setStartDate(startOfWeek(mostRecentEntryUpdate.data.date));
      setEndDate(endOfWeek(mostRecentEntryUpdate.data.date));
    }
  }, [mostRecentEntryUpdate.data]);

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

function useMostRecentEntry() {
  return useQuery({
    queryKey: ["most-recent"],
    queryFn: async () => await getMostRecentJournalEntry(),
  });
}

function useAnalyses(start: Date, end: Date) {
  return useQuery({
    queryKey: ["analyses-period", { start, end }],
    queryFn: async () => await getChartAnalyses(start, end),
  });
}
