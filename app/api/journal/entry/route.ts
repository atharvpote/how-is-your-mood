import { NextResponse } from "next/server";
import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { z } from "zod";
import { analyze } from "@/utils/ai";
import { Analysis } from "@prisma/client";

export async function GET() {
  const user = await getUserByClerkId();

  if (!user)
    return NextResponse.json(
      {
        message: "Authentication credentials were missing or incorrect",
      },
      { status: 401 },
    );

  const entries = await prisma.journalEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ entries }, { status: 200 });
}

export async function POST(request: Request) {
  const user = await getUserByClerkId();

  if (!user)
    return NextResponse.json(
      {
        message: "Authentication credentials were missing or incorrect",
      },
      { status: 401 },
    );

  const data: unknown = await request.json();

  const { content } = z.object({ content: z.string() }).parse(data);

  const { analysis } = (await createEntry(content)) as { analysis: Analysis };

  return NextResponse.json(
    {
      analysis,
    },
    { status: 201 },
  );
}

export async function createEntry(content: string) {
  const user = await getUserByClerkId();

  if (!user) throw new Error("Clerk user not found");

  const entry = await prisma.journalEntry.create({
    data: {
      userId: user.id,
      content,
    },
  });

  const openAiResponse = await analyze(content);

  if (!openAiResponse)
    return NextResponse.json(
      {
        message: "Failed to generate analysis",
      },
      { status: 500 },
    );

  const analysis = await prisma.analysis.create({
    data: {
      color: openAiResponse.color,
      mood: openAiResponse.mood,
      negative: openAiResponse.negative,
      subject: openAiResponse.subject,
      summery: openAiResponse.summery,
      sentimentScore: openAiResponse.sentimentScore,
      entryId: entry.id,
      userId: user.id,
    },
  });

  return { analysis };
}
