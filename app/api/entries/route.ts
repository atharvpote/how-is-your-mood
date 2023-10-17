import { NextResponse } from "next/server";
import { errorResponse } from "@/utils";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

export async function GET() {
  try {
    const userId = await getUserIdByClerkId();

    const entries = await prisma.journal.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      select: { id: true, date: true, content: true },
    });

    return NextResponse.json({ entries }, { status: 200 });
  } catch (error) {
    return errorResponse(error, 401);
  }
}
