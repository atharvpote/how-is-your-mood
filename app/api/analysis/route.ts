import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { errorResponse } from "@/utils/server";

export async function POST(request: Request) {
  try {
    const { start, end } = z
      .object({ start: z.string().datetime(), end: z.string().datetime() })
      .parse(await request.json());

    try {
      const user = await getUserByClerkId();

      const analyses = await prisma.analysis.findMany({
        where: {
          userId: user.id,
          AND: [
            { date: { gte: new Date(start) } },
            { date: { lte: new Date(end) } },
          ],
        },
        orderBy: { date: "asc" },
      });

      return NextResponse.json({ analyses }, { status: 200 });
    } catch (error) {
      return errorResponse(error, 401);
    }
  } catch (error) {
    return errorResponse(error, 400);
  }
}
