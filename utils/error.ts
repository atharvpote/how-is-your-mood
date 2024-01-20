import { isAxiosError } from "axios";
import { z } from "zod";

export function errorAlert(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response) {
      const { status } = error.response;
      const data: unknown = error.response.data;

      const validation = z.object({ message: z.string() }).safeParse(data);

      validation.success
        ? alert(`${status}: ${validation.data.message}`)
        : console.error("Unknown error", data);
    } else if (error.request) {
      alert("You're offline");
    } else {
      alert(error.message);
    }
  } else {
    alert("Unknown error");

    console.error(error);
  }
}

export function handleSWRError(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response) {
      const { status } = error.response;
      const data: unknown = error.response.data;

      const validation = z.object({ message: z.string() }).safeParse(data);

      if (validation.success) {
        throw new Error(`${status}: ${validation.data.message}`);
      } else {
        throw new Error(`Unknown error: ${Object(data)}`);
      }
    } else if (error.request) {
      throw new Error("You're offline");
    } else {
      throw new Error(`"Error": ${error.message}`);
    }
  } else {
    throw new Error(`Unknown Error: ${Object(error)}`);
  }
}

export const analysisNotFound = "NotFoundError: No Analysis found.";
