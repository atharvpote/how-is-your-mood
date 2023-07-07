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

    return NextResponse.json({ data: entry });
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
  }
}
