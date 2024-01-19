import { NextResponse } from "next/server";

export function jsonResponse(status: number, body = {}) {
  return NextResponse.json(body, { status });
}

export class ErrorBody {
  message: string;
  error?: unknown;

  constructor(error: unknown) {
    if (error instanceof Error) this.message = error.message;
    else {
      this.message = "Unknown error";
      this.error = error;
    }
  }
}
