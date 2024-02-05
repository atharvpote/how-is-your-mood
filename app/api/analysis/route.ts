import { NextRequest } from "next/server";
import { z } from "zod";
import { getUserIdByClerkId } from "@/utils/auth";
import { fetchChatAnalysis } from "@/utils/fetcher";
import { parseValidatedData } from "@/utils/validator";
import { ErrorBody, jsonResponse } from "@/utils/apiResponse";

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

      try {
        const analyses = await fetchChatAnalysis(
          userId,
          new Date(start),
          new Date(end),
        );

        return jsonResponse(200, { analyses });
      } catch (error) {
        return jsonResponse(500, new ErrorBody(error));
      }
    } catch (error) {
      return jsonResponse(401, new ErrorBody(error));
    }
  } catch (error) {
    return jsonResponse(400, new ErrorBody(error));
  }
}
