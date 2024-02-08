import { NextResponse } from "next/server";
import { errorMessage } from "./error";

export function createJsonResponse(status: number, body = {}) {
  return NextResponse.json(body, { status });
}

export function createErrorResponse(status: number, error: unknown) {
  return NextResponse.json({ message: errorMessage(error) }, { status });
}
