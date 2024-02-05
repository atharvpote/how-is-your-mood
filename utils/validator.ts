import { z, SafeParseReturnType, ZodError } from "zod";
import { RequestContext } from "./types";

export function contextValidator({ params }: RequestContext) {
  return z.object({ id: z.string().uuid() }).safeParse(params);
}

export function parseValidatedData<T>(result: SafeParseReturnType<T, T>) {
  if (!result.success) throw new Error(formatZodErrors(result.error));

  return result.data;
}

export function validateNotNull<T>(
  input: unknown,
  errorMessage: string,
): asserts input is T {
  if (!input) throw new Error(errorMessage);
}

function formatZodErrors(zodError: ZodError) {
  return zodError.format()._errors.join(", ");
}
