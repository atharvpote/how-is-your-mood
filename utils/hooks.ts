"use client";

import { useState } from "react";
import useSWR from "swr";
import { Journal, Analysis } from "@prisma/client";
import { createURL, handleError } from "./client";

export function useEntries() {
  return useSWR<Journal[], Error>("/api/journal", async (url: string) => {
    const response = await fetch(new Request(createURL(url)), {
      method: "GET",
    });

    if (!response.ok) await handleError(response);

    const { entries } = (await response.json()) as { entries: Journal[] };

    return entries;
  });
}

export function useAnalyses(start: Date, end: Date) {
  return useSWR<Analysis[], Error>({ start, end }, async () => {
    const response = await fetch(
      new Request(createURL("/api/analysis/"), {
        method: "POST",
        body: JSON.stringify({ start, end }),
      }),
    );

    if (!response.ok) await handleError(response);

    const { analyses } = (await response.json()) as { analyses: Analysis[] };

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
