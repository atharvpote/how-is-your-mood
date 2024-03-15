import { z, ZodError, ZodSchema } from "zod";
import { RequestContext } from "./types";

export function validateRequestContext(context: RequestContext) {
  return validatedData(
    z.object({ params: z.object({ id: z.string().uuid() }) }),
    context,
  );
}

export function validatedData<T>(schema: ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);

  if (!result.success) throw new Error(formatZodErrors(result.error));

  return result.data;
}

function formatZodErrors(zodError: ZodError) {
  return zodError.format()._errors.join(", ");
}
