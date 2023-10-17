"use client";

import axios, { AxiosError } from "axios";
import useSWR from "swr";
import { ChartAnalysis } from "./types";

export function useAnalyses(start: Date, end: Date) {
  const params = new URLSearchParams({
    start: start.toISOString(),
    end: end.toISOString(),
  });

  return useSWR<ChartAnalysis[], AxiosError>({ start, end }, async () => {
    const {
      data: { analyses },
    } = await axios.get<{ analyses: ChartAnalysis[] }>(
      `/api/analysis?${params.toString()}`,
    );

    return analyses;
  });
}
