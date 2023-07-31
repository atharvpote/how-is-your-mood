import { NextResponse } from "next/server";
import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { createEntry, errorResponse } from "@/utils/server";

export async function GET() {
  try {
    const user = await getUserByClerkId();

    const entries = await prisma.journal.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    if (!entries.length)
      return NextResponse.json(
        { message: "No matching records found" },
        { status: 500 },
      );

    return NextResponse.json({ entries }, { status: 200 });
  } catch (error) {
    return errorResponse(error, 401);
  }
}

export async function POST() {
  try {
    const user = await getUserByClerkId();

    const { entry, analysis } = await createEntry(user);

    return NextResponse.json(
      {
        entry,
        analysis,
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error, 401);
  }
}
