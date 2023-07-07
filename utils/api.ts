import type { JournalEntry } from "@prisma/client";

export async function createNewEntry() {
  const response = await fetch(
    new Request(createURL("/api/journal"), {
      method: "POST",
    }),
  );

  if (response.ok) {
    const data: unknown = await response.json();

    try {
      validateResponse(data);

      return data.data;
    } catch (error: unknown) {
      if (error instanceof Error) console.error(error.message);
    }
  }
}

function createURL(path: string) {
  return window.location.origin + "" + path;
}

interface ResponseType {
  data: JournalEntry;
}

function validateResponse(res: unknown): asserts res is ResponseType {
  if (!(res && typeof res === "object" && "data" in res))
    throw new Error("Response from '/api/journal' is not valid");
}
