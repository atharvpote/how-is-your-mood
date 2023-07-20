import { NextResponse } from "next/server";
import { Analysis } from "@prisma/client";
import { z } from "zod";
import { analyze } from "@/utils/ai";
import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

interface ParamType {
  params: {
    id: string;
  };
}

export async function GET(_: Request, { params }: ParamType) {
  const user = await getUserByClerkId();

  if (!user)
    return NextResponse.json(
      {
        message: "Authentication credentials were missing or incorrect",
      },
      { status: 401 },
    );

  const entry = await prisma.journalEntry.findUnique({
    where: { userId_id: { userId: user.id, id: params.id } },
    include: { analysis: true },
  });

  if (!entry)
    return NextResponse.json(
      {
        message: "Entry not found",
      },
      { status: 500 },
    );

  return NextResponse.json({ entry, analyze: entry.analysis }, { status: 200 });
}

export async function PUT(request: Request, { params }: ParamType) {
  const user = await getUserByClerkId();

  if (!user)
    return NextResponse.json(
      {
        message: "Authentication credentials were missing or incorrect",
      },
      { status: 401 },
    );

  const response: unknown = await request.json();

  console.log(response);

  const validation = z
    .union([
      z.object({ type: z.literal("content"), content: z.string() }),
      z.object({ type: z.literal("date"), date: z.string() }),
    ])
    .safeParse(response);

  if (!validation.success)
    return NextResponse.json(
      {
        message: "Validation errors in your request",
        errors: validation.error,
      },
      { status: 400 },
    );

  if (validation.data.type === "date") {
    const { date } = validation.data;

    await updateDate(user.id, params.id, new Date(date));

    return NextResponse.json({ status: 200 });
  }

  const { content } = validation.data;

  const analysis = await updateContent(user.id, params.id, content);

  return NextResponse.json(
    {
      analysis,
    },
    { status: 200 },
  );
}

async function updateContent(userId: string, entryId: string, content: string) {
  const entry = await prisma.journalEntry.update({
    where: { userId_id: { userId, id: entryId } },
    data: { content },
  });

  let analysis: Analysis;

  if (content.trim().length === 0)
    analysis = await prisma.analysis.update({
      where: { entryId: entry.id },
      data: {
        emoji: "",
        mood: "",
        subject: "",
        summery: "",
        sentimentScore: 0,
      },
    });
  else {
    const openAiResponse = await analyze(content);

    if (!openAiResponse)
      return NextResponse.json(
        {
          message: "Failed to generate analysis",
        },
        { status: 500 },
      );

    analysis = await prisma.analysis.update({
      where: { entryId: entry.id },
      data: {
        emoji: openAiResponse.emoji,
        mood: openAiResponse.mood,
        subject: openAiResponse.subject,
        summery: openAiResponse.summery,
        sentimentScore: openAiResponse.sentimentScore,
      },
    });
  }

  return analysis;
}

async function updateDate(userId: string, entryId: string, date: Date) {
  const res = await prisma.journalEntry.update({
    where: { userId_id: { userId, id: entryId } },
    data: { entryDate: date },
  });

  console.log(res);
}

export async function DELETE(_: Request, { params }: ParamType) {
  const user = await getUserByClerkId();

  if (!user)
    return NextResponse.json(
      {
        message: "Authentication credentials were missing or incorrect",
      },
      { status: 401 },
    );
  try {
    await prisma.journalEntry.delete({
      where: { userId_id: { userId: user.id, id: params.id } },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: 500 },
      );
  }
}
