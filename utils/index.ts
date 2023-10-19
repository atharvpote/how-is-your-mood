import { Dispatch, RefObject, SetStateAction } from "react";
import { NextResponse } from "next/server";
import { isAxiosError } from "axios";
import { ZodError, z } from "zod";
import { Analysis, Journal } from "@prisma/client";

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
  return error.format()._errors.join(", ");
}

export function setTimeToMidnight(date: Date) {
  return new Date(date.setHours(0, 0, 0, 0));
}

export function showPicker(element: RefObject<HTMLInputElement>) {
  return () => element.current?.showPicker();
}

export interface RequestContext {
  params: { id?: string };
}

export function contextValidator({ params }: RequestContext) {
  return z.object({ id: z.string().uuid() }).safeParse(params);
}

export function isTouchDevice() {
  return window.matchMedia("(any-pointer: coarse)").matches;
}

export interface ErrorBoundaryProps {
  error: Error & { digest?: string };
}

export type ChartAnalysis = Pick<
  Analysis,
  "sentiment" | "date" | "mood" | "emoji"
>;

export type EntryAnalysis = Pick<
  Analysis,
  "sentiment" | "mood" | "emoji" | "subject" | "summery"
>;

export type Entry = Pick<Journal, "id" | "date" | "content">;

export type SetState<T> = Dispatch<SetStateAction<T>>;
