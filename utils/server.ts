import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function errorResponse(error: unknown, status: number) {
  return NextResponse.json(
    error instanceof Error
      ? { error: { code: status, message: error.message } }
      : {
          message: "Unknown error",
          error,
        },
    { status },
  );
}

export function formatErrors(error: ZodError) {
  return error.format()._errors.join(".\n");
}

export function setTimeToMidnight(date: Date) {
  return new Date(date.setHours(0, 0, 0, 0));
}
