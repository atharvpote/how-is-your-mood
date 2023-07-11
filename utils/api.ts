import { Analysis, JournalEntry } from "@prisma/client";
import { z } from "zod";

export async function createNewEntry() {
  const response = await fetch(
    new Request(createURL("/api/journal"), {
      method: "POST",
    }),
  );

  try {
    if (!response.ok)
      throw new Error(`Bad response from "/api/journal" at "createNewEntry"`);

    const responseData: unknown = await response.json();

    validateResponse(responseData);

    return { entry: responseData.entry, analysis: responseData.analysis };
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
  }
}

export async function updateEntry(id: string, content: string) {
  const response = await fetch(
    new Request(createURL(`/api/journal/${id}`), {
      method: "PATCH",
      body: JSON.stringify({ content }),
    }),
  );

  try {
    if (!response.ok)
      throw new Error(
        `Bad response from "/api/journal/${id}" at "updateEntry"`,
      );

    const responseData: unknown = await response.json();

    validateResponse(responseData);

    return { data: responseData.entry, analysis: responseData.analysis };
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
  }
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

interface ResponseType {
  entry: JournalEntry;
  analysis: Analysis;
}

function validateResponse(res: unknown): asserts res is ResponseType {
  if (!(res && typeof res === "object" && "entry" in res && "analysis" in res))
    throw new Error(
      `Invalid response from "/api/journal/[id] at "updateEntry"`,
    );
}
function createURL(path: string) {
  return window.location.origin + "" + path;
}
