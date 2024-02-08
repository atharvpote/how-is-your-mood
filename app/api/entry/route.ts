import { setHours, setMinutes } from "date-fns";
import { getCurrentUserId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { createErrorResponse, createJsonResponse } from "@/utils/response";

export async function POST() {
  try {
    const userId = await getCurrentUserId();

    const { id, date } = await createJournal(userId);
    await createAnalysis({ date, entryId: id, userId });

    return createJsonResponse(201, { id });
  } catch (error) {
    return createErrorResponse(500, error);
  }
}

async function createJournal(userId: string) {
  return await prisma.journal.create({
    data: {
      userId,
      content: "",
      date: normalizeTime(new Date()),
    },
    select: { id: true, date: true },
  });
}

function normalizeTime(date: Date) {
  return new Date(setMinutes(setHours(date, 5), 30));
}

async function createAnalysis({
   date,
   entryId,
   userId,
 }: {
   entryId: string;
   userId: string;
   date: Date;
 }) {
   await prisma.analysis.create({
     data: {
       emoji: "",
       mood: "",
       subject: "",
       summery: "",
       entryId,
       date,
       userId,
     },
   });
 }
