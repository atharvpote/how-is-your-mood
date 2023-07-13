import { z } from "zod";

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
