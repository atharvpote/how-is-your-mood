import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdByClerkId } from "@/utils/auth";
import { errorResponse } from "@/utils/error";
import { fetchChatAnalysis } from "@/utils/fetcher";
import { zodRequestValidator } from "@/utils/validator";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const startValidation = z.string().datetime().safeParse(params.get("start"));
  const endValidation = z.string().datetime().safeParse(params.get("end"));

  try {
    const start = zodRequestValidator(startValidation);
    const end = zodRequestValidator(endValidation);

    try {
      const userId = await getUserIdByClerkId();

      const analyses = await fetchChatAnalysis(
        userId,
        new Date(start),
        new Date(end),
      );

      return NextResponse.json({ analyses }, { status: 200 });
    } catch (error) {
      return errorResponse(error, 401);
    }
  } catch (error) {
    return errorResponse(error, 400);
  }
}
