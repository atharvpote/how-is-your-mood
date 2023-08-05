import { z } from "zod";
import { addDays } from "date-fns";
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

export function mapAnalyses(start: Date, end: Date, analyses: Analysis[]) {
  const range: Date[] = [];
  let current = start;

  while (current <= end) {
    range.push(current);

    current = addDays(current, 1);
  }

  return range.map((date) => {
    const analysis = analyses.find(
      (analysis) =>
        new Date(analysis.date).toDateString() === date.toDateString(),
    );

    if (analysis) return analysis;

    return {
      date,
    };
  });
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

export async function handleError(response: Response) {
  const data = (await response.json()) as {
    message: string;
    error?: unknown;
  };

  if (data.error) console.error(data.error);
  throw new Error(data.message);
}

export function createURL(path: string) {
  return window.location.origin + "" + path;
}
