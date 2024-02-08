import { NextResponse } from "next/server";
import { createErrorMessage } from "./error";

export function createJsonResponse(status: number, body = {}) {
  return NextResponse.json(body, { status });
}

export function createErrorResponse(status: number, error: unknown) {
  return NextResponse.json({ message: createErrorMessage(error) }, { status });
}
