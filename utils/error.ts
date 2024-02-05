import { AxiosError, isAxiosError } from "axios";
import { z } from "zod";

export function errorAlert(error: unknown) {
  if (isAxiosError(error))
    if (error.response) {
      const { status } = error.response;
      const data: unknown = error.response.data;

      const validation = z.object({ message: z.string() }).safeParse(data);

      validation.success
        ? alert(`${status}: ${validation.data.message}`)
        : console.error("Unknown error", data);
    } else if (error.request) alert("You're offline");
    else alert(error.message);
  else {
    alert("Unknown error");

    console.error(error);
  }
}

export function handleAxiosError(error: AxiosError) {
  if (error.response) {
    const { status, data } = error.response;

    const validation = z.object({ message: z.string() }).safeParse(data);

    if (validation.success)
      throw new Error(`${status}: ${validation.data.message}`);

    throw new Error(`Unknown error: ${Object(data)}`);
  } else if (error.request) throw new Error("You're offline");
  else throw new Error(error.message);
}

export const analysisNotFound = "NotFoundError: No Analysis found.";


