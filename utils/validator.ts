import { z, SafeParseReturnType, ZodError } from "zod";
import { RequestContext } from "./types";

export function contextValidator({ params }: RequestContext) {
  return z.object({ id: z.string().uuid() }).safeParse(params);
}

export function zodRequestValidator<T>(validation: SafeParseReturnType<T, T>) {
  if (!validation.success) throw new Error(formatErrors(validation.error));

  return validation.data;
}

export function notNullValidator<T>(
  value: unknown,
  error: string,
): asserts value is T {
  if (!value) throw new Error(error);
}

function formatErrors(error: ZodError) {
  return error.format()._errors.join(", ");
}
