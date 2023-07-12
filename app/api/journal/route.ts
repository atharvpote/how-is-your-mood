import { NextResponse } from "next/server";
import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

export async function POST() {
  const user = await getUserByClerkId();

  try {
    if (!user)
      throw new Error(
        `Did not get "Clerk User Object" from "getUserByClerkId" at "/api/journal"`,
      );

    const entry = await prisma.journalEntry.create({
      data: {
        userId: user.id,
        content: "",
      },
    });

    const analysis = await prisma.analysis.create({
      data: {
        userId: user.id,
        color: "",
        mood: "",
        negative: false,
        subject: "",
        summery: "",
        entryId: entry.id,
      },
    });

    return NextResponse.json({ entry, analysis });
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
  }
}
