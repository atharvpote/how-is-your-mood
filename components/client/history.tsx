"use client";

import { startOfWeek, endOfWeek } from "date-fns";
import { useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import { ChartAnalysis } from "@/utils/types";
import { deserializeDate } from "@/utils";
import { parseValidatedData } from "@/utils/validator";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import HistoryChart from "../server/chart";

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

let useInitialMostRecent = true;

function useMostRecent() {
  return useQuery({
    queryKey: ["most-recent"],
    queryFn: async () => {
      if (useInitialMostRecent) {
        useInitialMostRecent = false;

        return null;
      }

      const { data } = await axios.get<unknown>("/api/analysis/most-recent");

      const { mostRecent } = parseValidatedData(
        z
          .object({
            mostRecent: z.union([z.null(), z.string()]),
          })
          .safeParse(data),
      );

      return mostRecent === null ? mostRecent : new Date(mostRecent);
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

      const { data } = await axios.get<unknown>(
        `/api/analysis?${new URLSearchParams({
          start: start.toISOString(),
          end: end.toISOString(),
        }).toString()}`,
      );

      const { analyses } = parseValidatedData(
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
    },
  });
}
