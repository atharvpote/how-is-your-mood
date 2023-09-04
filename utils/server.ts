import { NextResponse } from "next/server";
import { Analysis } from "@prisma/client";
import { prisma } from "./db";
import { analyze } from "./ai";
import { getUserByClerkId } from "./auth";

export async function getEntry(id: string) {
  const user = await getUserByClerkId();

  const entry = await prisma.journal.findUniqueOrThrow({
    where: { userId_id: { userId: user.id, id } },
  });

  const analysis = await prisma.analysis.findUniqueOrThrow({
    where: { userId_entryId: { userId: user.id, entryId: id } },
  });

  return { entry, analysis };
}

export async function getMostRecentEntry() {
  const user = await getUserByClerkId();

  return await prisma.journal.findFirst({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });
}

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
      userId: user.id,
    },
  });

  return analysis.entryId;
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

    let analysis: Analysis;

    if (content.trim().length === 0)
      analysis = await prisma.analysis.update({
        where: { entryId: entry.id },
        data: {
          emoji: "",
          mood: "",
          subject: "",
          summery: "",
          sentiment: 0,
        },
      });
    else {
      const { mood, emoji, sentiment, subject, summery } =
        await analyze(content);

      analysis = await prisma.analysis.update({
        where: { entryId: entry.id },
        data: {
          emoji,
          mood,
          subject,
          summery,
          sentiment,
        },
      });
    }

    return NextResponse.json({ analysis }, { status: 200 });
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
