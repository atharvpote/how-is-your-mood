"use client";

import { useState } from "react";
import useSWR from "swr";
import { z } from "zod";
import { Analysis, Journal } from "@prisma/client";

export async function createEntry() {
  const response = await fetch(new Request(createURL("/api/journal")), {
    method: "POST",
  });

  if (!response.ok) await handleError(response);

  const data = (await response.json()) as {
    entry: Journal;
    analysis: Analysis;
  };

  return data.entry.id;
}

export async function updateContent(content: string, id: string) {
  const response = await fetch(
    new Request(createURL(`/api/journal/${id}`), {
      method: "PUT",
      body: JSON.stringify({ type: "content", content }),
    }),
  );

  if (!response.ok) await handleError(response);

  const data = (await response.json()) as { analysis: Analysis };

  return { analysis: data.analysis };
}

export async function updateDate(date: Date, id: string) {
  const response = await fetch(
    new Request(createURL(`/api/journal/${id}`), {
      method: "PUT",
      body: JSON.stringify({ type: "date", date }),
    }),
  );

  if (!response.ok) await handleError(response);
}

export async function deleteEntry(id: string) {
  const response = await fetch(new Request(createURL(`/api/journal/${id}`)), {
    method: "DELETE",
  });

  if (!response.ok) await handleError(response);
}

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

export function useAnalysis(date: Date) {
  return useSWR<Analysis[], Error>(date.toDateString(), async () => {
    const response = await fetch(
      new Request(createURL("/api/analysis/"), {
        method: "POST",
        body: JSON.stringify({ date }),
      }),
    );

    if (!response.ok) await handleError(response);

    const { analyses } = (await response.json()) as { analyses: Analysis[] };

    return analyses;
  });
}

export async function askQuestion(question: string) {
  const response = await fetch(
    new Request(createURL("/api/question"), {
      method: "POST",
      body: JSON.stringify({ question }),
    }),
  );

  if (!response.ok) await handleError(response);

  const responseData: unknown = await response.json();

  const { data } = z.object({ data: z.string() }).parse(responseData);

  return data;
}

export function errorAlert(error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);

    alert(error.message);
  } else {
    console.error("Unknown error", error);

    alert("Unknown error");
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      event.matches ? setTheme("dark") : setTheme("light");
    });

  return theme;
}

function createURL(path: string) {
  return window.location.origin + "" + path;
}

async function handleError(response: Response) {
  const data = (await response.json()) as {
    message: string;
    error?: unknown;
  };

  if (data.error) console.error(data.error);
  throw new Error(data.message);
}
