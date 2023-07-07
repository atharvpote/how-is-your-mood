import { Analysis, JournalEntry } from "@prisma/client";

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

    return responseData.data;
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

    return { data: responseData.data, analysis: responseData.analysis };
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
  }
}

function createURL(path: string) {
  return window.location.origin + "" + path;
}

interface ResponseType {
  data: JournalEntry;
  analysis: Analysis;
}

function validateResponse(res: unknown): asserts res is ResponseType {
  if (!(res && typeof res === "object" && "data" in res && "analysis" in res))
    throw new Error(
      `Invalid response from "/api/journal/[id] at "updateEntry"`,
    );
}
