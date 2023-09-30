import { NextResponse } from "next/server";

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
