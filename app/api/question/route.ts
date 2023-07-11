import { qa } from "@/utils/ai";
import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  const requestJson: unknown = await request.json();

  try {
    const { question } = z.object({ question: z.string() }).parse(requestJson);

    const user = await getUserByClerkId();

    if (!user)
      throw new Error(
        `Did not get "Clerk User Object" from "getUserByClerkId" at "/api/question/"`,
      );

    const entries = await prisma.journalEntry.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        createdAt: true,
        content: true,
      },
    });

    const answer = await qa(question, entries);

    if (!answer)
      throw new Error(`Did not get "answer" from "qa" at "/api/question/"`);

    return NextResponse.json({ data: answer });
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
  }
}
