import { NextRequest } from "next/server";
import { z } from "zod";
import { getUserIdByClerkId } from "@/utils/auth";
import { fetchChatAnalysis } from "@/utils/fetcher";
import { validatedData } from "@/utils/validator";
import { createErrorResponse, createJsonResponse } from "@/utils/response";

export async function GET({ nextUrl: { searchParams } }: NextRequest) {
  try {
    const start = validatedData(
      z.string().datetime(),
      searchParams.get("start"),
    );
    const end = validatedData(z.string().datetime(), searchParams.get("end"));

    try {
      const userId = await getUserIdByClerkId();

      const analyses = await fetchChatAnalysis(
        userId,
        new Date(start),
        new Date(end),
      );

      return createJsonResponse(200, { analyses });
    } catch (error) {
      return createErrorResponse(500, error);
    }
  } catch (error) {
    return createErrorResponse(400, error);
  }
}
