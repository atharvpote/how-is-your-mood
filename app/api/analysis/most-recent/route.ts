import { NextResponse } from "next/server";
import { errorResponse } from "@/utils";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

export async function GET() {
  try {
    const userId = await getUserIdByClerkId();

    try {
      const mostRecent = await prisma.journal.findFirst({
        where: { userId },
        orderBy: { date: "desc" },
        select: { date: true },
      });

      return NextResponse.json(
        { mostRecent: mostRecent?.date },
        { status: 200 },
      );
    } catch (error) {
      return errorResponse(error, 500);
    }
  } catch (error) {
    return errorResponse(error, 401);
  }
}
