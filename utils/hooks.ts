"use client";

import { useState } from "react";
import useSWR from "swr";
import axios, { AxiosError } from "axios";
import { Journal, Analysis } from "@prisma/client";

export type Entry = Pick<Journal, "id" | "date" | "content">;

export function useEntries() {
  return useSWR<Entry[], AxiosError>("/api/journal", async (url: string) => {
    const {
      data: { entries },
    } = await axios.get<{ entries: Journal[] }>(url);

    return entries;
  });
}

export type ChartAnalysis = Pick<
  Analysis,
  "sentiment" | "date" | "mood" | "emoji"
>;

export function useAnalyses(start: Date, end: Date) {
  return useSWR<ChartAnalysis[], AxiosError>({ start, end }, async () => {
    const {
      data: { analyses },
    } = await axios.post<{ analyses: Analysis[] }>("/api/analysis/", {
      start,
      end,
    });

    return analyses;
  });
}

export default function useEntryDate(id: string) {
  return useSWR<Date, AxiosError>(`/api/journal/${id}`, async (url: string) => {
    const {
      data: { date },
    } = await axios.get<{ date: Date }>(url);

    return date;
  });
}

export function useGlobalTheme() {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [theme, setTheme] = useState<"light" | "dark">(
    isDark ? "dark" : "light",
  );

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      event.matches ? setTheme("dark") : setTheme("light");
    });

  return theme;
}
