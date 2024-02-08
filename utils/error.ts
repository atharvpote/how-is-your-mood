import { isAxiosError } from "axios";
import { z } from "zod";

export const ANALYSIS_NOT_FOUND = "NotFoundError: No Analysis found.";

export function createErrorMessage(error: unknown) {
  if (process.env.NODE_ENV === "production")
    return isAxiosError(error) && error.request
      ? "You're offline"
      : "Something went wrong, please try again later.";
  else if (isAxiosError(error))
    if (error.response) {
      const errorData: unknown = error.response.data;

      const validation = z.object({ message: z.string() }).safeParse(errorData);

      return validation.success
        ? `${error.response.status}: ${validation.data.message}`
        : `"Unknown error", ${String(errorData)}`;
    } else if (error.request) {
      return "You're offline";
    } else {
      return error.message;
    }
  else return `"Unknown error", ${String(error)}`;
}
