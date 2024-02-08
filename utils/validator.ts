import { z, ZodError, ZodSchema } from "zod";
import { IdParams } from "./types";

export function validateUrlIdParam(params: IdParams) {
  return validatedData(z.object({ id: z.string().uuid() }), params);
}

export function validatedData<T>(schema: ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);

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
