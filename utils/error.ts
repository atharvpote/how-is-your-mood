export const ANALYSIS_NOT_FOUND = "NotFoundError: No Analysis found.";

export function createErrorMessage(error: unknown) {
  if (process.env.NODE_ENV === "production")
    return "Something went wrong, please try again later.";

  if (error instanceof Error) return error.message;

  return `"Unknown error", ${String(error)}`;
}
