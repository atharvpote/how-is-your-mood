import { Analysis, JournalEntry } from "@prisma/client";
import useSWR from "swr";
import { z } from "zod";

export async function createEntry() {
  const response = await fetch(new Request(createURL("/api/journal")), {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to create entry");

  const data = (await response.json()) as {
    entry: JournalEntry;
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

  if (!response.ok) throw new Error("Failed to update content");

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

  if (!response.ok) throw new Error("Failed to update date");
}

export async function deleteEntry(id: string) {
  const response = await fetch(new Request(createURL(`/api/journal/${id}`)), {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete entry");
}

export function useEntries() {
  return useSWR<JournalEntry[], Error>("/api/journal", async (url: string) => {
    const response = await fetch(new Request(createURL(url)), {
      method: "GET",
    });

    if (!response.ok) throw new Error("Failed to fetch entries");

    const data = (await response.json()) as { entries: JournalEntry[] };

    return data.entries;
  });
}

export async function askQuestion(question: string) {
  const response = await fetch(
    new Request(createURL("/api/question"), {
      method: "POST",
      body: JSON.stringify({ question }),
    }),
  );

  try {
    if (!response.ok)
      throw new Error(`Bad response from "/api/question" at "askQuestion"`);

    const responseData: unknown = await response.json();

    const { data } = z.object({ data: z.string() }).parse(responseData);

    return data;
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
  }
}

export function createURL(path: string) {
  return window.location.origin + "" + path;
}
