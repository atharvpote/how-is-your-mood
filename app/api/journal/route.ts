import { NextResponse } from "next/server";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { createEntry, errorResponse } from "@/utils/server";

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

export async function POST() {
  try {
    const userId = await getUserIdByClerkId();

    const id = await createEntry(userId);

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 401);
  }
}
