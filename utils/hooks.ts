"use client";

import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { Journal, Analysis } from "@prisma/client";

export function useEntries() {
  return useSWR<Journal[], Error>("/api/journal", async (url: string) => {
    const {
      data: { entries },
    } = await axios.get<{ entries: Journal[] }>(url);

    return entries;
  });
}

export function useAnalyses(start: Date, end: Date) {
  return useSWR<Analysis[], Error>({ start, end }, async () => {
    const {
      data: { analyses },
    } = await axios.post<{ analyses: Analysis[] }>("/api/analysis/", {
      start,
      end,
    });

    return analyses;
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
