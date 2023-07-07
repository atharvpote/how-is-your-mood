import { NextResponse } from "next/server";
import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

export async function POST() {
  const user = await getUserByClerkId();

  if (user) {
    const entry = await prisma.journalEntry.create({
      data: {
        userId: user.id,
        content: "Write about your day",
      },
    });

    return NextResponse.json({ data: entry });
  }
}
