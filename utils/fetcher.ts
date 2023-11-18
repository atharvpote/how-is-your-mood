import { prisma } from "./db";

export async function fetchMostRecentEntry(userId: string) {
  return await prisma.journal.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true },
  });
}

export async function fetchChatAnalysis(
  userId: string,
  start: Date,
  end: Date,
) {
  return await prisma.analysis.findMany({
    where: {
      userId,
      AND: [{ date: { gte: start } }, { date: { lte: end } }],
    },
    orderBy: { date: "asc" },
    select: { sentiment: true, date: true, mood: true, emoji: true },
  });
}

export async function fetchEntryAndAnalysis(userId: string, id: string) {
  return await prisma.journal.findUniqueOrThrow({
    where: { userId_id: { userId, id } },
    select: {
      content: true,
      date: true,

      analysis: {
        select: {
          emoji: true,
          mood: true,
          sentiment: true,
          subject: true,
          summery: true,
        },
      },
    },
  });
}

export async function fetchEntries(userId: string) {
  return await prisma.journal.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: { id: true, date: true, preview: true },
  });
}
