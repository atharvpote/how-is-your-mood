import { NextRequest } from "next/server";
import { z } from "zod";
import { getUserIdByClerkId } from "@/utils/auth";
import { fetchChatAnalysis } from "@/utils/fetcher";
import { parseValidatedData } from "@/utils/validator";
import { createErrorResponse, createJsonResponse } from "@/utils/response";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  try {
    const start = parseValidatedData(
      z.string().datetime().safeParse(params.get("start")),
    );
    const end = parseValidatedData(
      z.string().datetime().safeParse(params.get("end")),
    );

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
