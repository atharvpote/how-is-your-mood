import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, formatErrors } from "@/utils";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const startValidation = z.string().datetime().safeParse(params.get("start"));
  const endValidation = z.string().datetime().safeParse(params.get("end"));

  try {
    if (!startValidation.success)
      throw new Error(formatErrors(startValidation.error));

    if (!endValidation.success)
      throw new Error(formatErrors(endValidation.error));

    const { data: start } = startValidation;
    const { data: end } = endValidation;

    try {
      const userId = await getUserIdByClerkId();

      const analyses = await prisma.analysis.findMany({
        where: {
          userId,
          AND: [
            { date: { gte: new Date(start) } },
            { date: { lte: new Date(end) } },
          ],
        },
        orderBy: { date: "asc" },
        select: { sentiment: true, date: true, mood: true, emoji: true },
      });

      return NextResponse.json({ analyses }, { status: 200 });
    } catch (error) {
      return errorResponse(error, 401);
    }
  } catch (error) {
    return errorResponse(error, 400);
  }
}
