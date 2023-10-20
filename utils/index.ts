import { Dispatch, RefObject, SetStateAction } from "react";
import { NextResponse } from "next/server";
import { isAxiosError } from "axios";
import { ZodError, z } from "zod";
import { Analysis, Journal } from "@prisma/client";

export function errorResponse(error: unknown, status: number) {
  return NextResponse.json(
    error instanceof Error
      ? { message: error.message }
      : {
          message: "Unknown error",
          error,
        },
    { status },
  );
}

export function errorAlert(error: unknown) {
  if (isAxiosError(error))
    if (error.response) {
      const { status } = error.response;
      const data: unknown = error.response.data;

      const validation = z.object({ message: z.string() }).safeParse(data);

      validation.success
        ? alert(`${status}: ${validation.data.message}`)
        : console.error("Unknown error", data);
    } else if (error.request) alert("You're offline");
    else {
      alert(error.message);
      console.error(`Error: ${error.message}`);
    }
  else {
    alert("Unknown error");

    console.error(error);
  }
}

export function handleHookError(error: unknown) {
  if (isAxiosError(error))
    if (error.response) {
      const { status } = error.response;
      const data: unknown = error.response.data;

      const validation = z.object({ message: z.string() }).safeParse(data);

      if (validation.success)
        throw new Error(`${status}: ${validation.data.message}`);
      else throw new Error(`Unknown error: ${Object(data)}`);
    } else if (error.request) throw new Error("You're offline");
    else throw new Error(`"Error": ${error.message}`);
  else throw new Error(`Unknown Error: ${Object(error)}`);
}

export function formatErrors(error: ZodError) {
  return error.format()._errors.join(", ");
}

export function setTimeToMidnight(date: Date) {
  return new Date(date.setHours(0, 0, 0, 0));
}

export function showPicker(element: RefObject<HTMLInputElement>) {
  return () => {
    if (!element.current) throw new Error("Input date is null");

    element.current.showPicker();
  };
}

export interface RequestContext {
  params: { id?: string };
}

export function contextValidator({ params }: RequestContext) {
  return z.object({ id: z.string().uuid() }).safeParse(params);
}

export function isTouchDevice() {
  return typeof window !== "undefined"
    ? window.matchMedia("(any-pointer: coarse)").matches
    : false;
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

export type Entry = Pick<Journal, "content" | "date" | "id">;

export type EntryPreview = Omit<Entry, "content"> & Pick<Journal, "preview">;

export type SetState<T> = Dispatch<SetStateAction<T>>;

export const previewLength = 100;

export function contentPreview(content: string) {
  return content.substring(0, previewLength);
}
