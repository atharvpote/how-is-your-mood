import { NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/utils/auth";
import { getAnalysis } from "@/utils/fetchers";
import { validatedData } from "@/utils/validator";
import { createErrorResponse, createJsonResponse } from "@/utils/response";

export async function GET({ nextUrl: { searchParams } }: NextRequest) {
  const dateSchema = z.string().datetime();

  try {
    const start = validatedData(dateSchema, searchParams.get("start"));
    const end = validatedData(dateSchema, searchParams.get("end"));

    try {
      const analyses = await getAnalysis({
        userId: await getCurrentUserId(),
        start: new Date(start),
        end: new Date(end),
      });

      return createJsonResponse(200, { analyses });
    } catch (error) {
      return createErrorResponse(500, error);
    }
  } catch (error) {
    return createErrorResponse(400, error);
  }
}
