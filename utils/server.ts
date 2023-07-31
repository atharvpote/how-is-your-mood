import { NextResponse } from "next/server";
import { prisma } from "./db";
import { analyze } from "./ai";
import { getMonth, getWeek, getYear } from "date-fns";

interface ClerkUser {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  clerkId: string;
  email: string;
}

export async function createEntry(user: ClerkUser) {
  const entry = await prisma.journal.create({
    data: {
      userId: user.id,
      content: "",
    },
  });

  const analysis = await prisma.analysis.create({
    data: {
      emoji: "",
      mood: "",
      subject: "",
      summery: "",
      entryId: entry.id,
      date: entry.date,
      week: getWeek(entry.date),
      month: getMonth(entry.date),
      year: getYear(entry.date),
      userId: user.id,
    },
  });

  return { entry, analysis };
}

export async function updateContent(
  userId: string,
  entryId: string,
  content: string,
) {
  try {
    const entry = await prisma.journal.update({
      where: { userId_id: { userId, id: entryId } },
      data: { content },
    });

    if (content.trim().length === 0) {
      const analysis = await prisma.analysis.update({
        where: { entryId: entry.id },
        data: {
          emoji: "",
          mood: "",
          subject: "",
          summery: "",
          sentiment: 0,
        },
      });

      return NextResponse.json(
        {
          analysis,
        },
        { status: 200 },
      );
    } else {
      const openAiResponse = await analyze(content);

      const analysis = await prisma.analysis.update({
        where: { entryId: entry.id },
        data: {
          emoji: openAiResponse.emoji,
          mood: openAiResponse.mood,
          subject: openAiResponse.subject,
          summery: openAiResponse.summery,
          sentiment: openAiResponse.sentimentScore,
        },
      });

      return NextResponse.json(
        {
          analysis,
        },
        { status: 200 },
      );
    }
  } catch (error) {
    return errorResponse(error, 500);
  }
}

export async function updateDate(userId: string, entryId: string, date: Date) {
  try {
    await prisma.journal.update({
      where: { userId_id: { userId, id: entryId } },
      data: { date },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return errorResponse(error, 500);
  }
}

export function errorResponse(error: unknown, status: number) {
  return NextResponse.json(
    error instanceof Error
      ? { message: error.message }
      : {
          message: "Unknown error",
          error,
        },
    { status },
  );
}
