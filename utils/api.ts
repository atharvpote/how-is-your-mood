import { JournalEntry } from "@prisma/client";

export async function createNewEntry() {
  const response = await fetch(
    new Request(createURL("/api/journal"), {
      method: "POST",
    }),
  );

  if (response.ok) {
    const responseData: unknown = await response.json();

    try {
      validateResponse(responseData);

      return responseData.data;
    } catch (error) {
      if (error instanceof Error) console.error(error.message);
    }
  }
}

export async function updateEntry(id: string, content: string) {
  const response = await fetch(
    new Request(createURL(`/api/journal/${id}`), {
      method: "PATCH",
      body: JSON.stringify({ content }),
    }),
  );

  if (response.ok) {
    const responseData: unknown = await response.json();

    try {
      validateResponse(responseData);

      return responseData.data;
    } catch (error) {
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
    throw new Error("Invalid response");
}
