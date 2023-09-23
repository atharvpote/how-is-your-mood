import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { errorResponse } from "@/utils/server";

export async function POST(request: Request) {
  try {
    const { start, end } = z
      .object({ start: z.string().datetime(), end: z.string().datetime() })
      .parse(await request.json());

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
