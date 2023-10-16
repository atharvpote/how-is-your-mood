import { RefObject } from "react";
import { NextResponse } from "next/server";
import { isAxiosError } from "axios";
import { ZodError, z } from "zod";

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

export function errorAlert(error: unknown) {
  if (isAxiosError(error)) {
    console.error(error.message);

    alert(error.message);
  } else {
    console.error("Unknown error", error);

    alert("Unknown error");
  }
}

export function formatErrors(error: ZodError) {
  return error.format()._errors.join(".\n");
}

export function setTimeToMidnight(date: Date) {
  return new Date(date.setHours(0, 0, 0, 0));
}

export function showPicker(element: RefObject<HTMLInputElement>) {
  return () => element.current?.showPicker();
}

export interface Context {
  params: { id?: string };
}

export function contextValidator({ params }: Context) {
  return z.object({ id: z.string().uuid() }).safeParse(params);
}
