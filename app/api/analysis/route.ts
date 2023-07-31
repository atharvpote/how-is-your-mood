import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { errorResponse } from "@/utils/server";
import { endOfMonth, startOfMonth } from "date-fns";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const date = new Date(
      z.object({ date: z.string() }).parse(await request.json()).date,
    );

    const user = await getUserByClerkId();

    const analyses = await prisma.analysis.findMany({
      where: {
        userId: user.id,
        AND: [
          { date: { gte: startOfMonth(date) } },
          { date: { lte: endOfMonth(date) } },
        ],
      },
      orderBy: { date: "asc" },
    });

    if (!analyses.length)
      return errorResponse(new Error("No matching records found"), 500);

    return NextResponse.json({ analyses }, { status: 200 });
  } catch (error) {
    return errorResponse(error, 401);
  }
}
