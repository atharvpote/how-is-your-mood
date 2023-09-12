"use client";

import { useState } from "react";
import useSWR from "swr";
import axios, { AxiosError } from "axios";
import { Journal, Analysis } from "@prisma/client";

export function useEntries() {
  return useSWR<Journal[], AxiosError>("/api/journal", async (url: string) => {
    const {
      data: { entries },
    } = await axios.get<{ entries: Journal[] }>(url);

    return entries;
  });
}

export function useAnalyses(start: Date, end: Date) {
  return useSWR<Analysis[], AxiosError>({ start, end }, async () => {
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

export function useTheme() {
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
