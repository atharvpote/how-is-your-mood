import { setHours, setMinutes } from "date-fns";
import { getCurrentUserId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { createErrorResponse, createJsonResponse } from "@/utils/response";

export async function POST() {
  try {
    return createJsonResponse(201, {
      id: await createEntry(await getCurrentUserId()),
    });
  } catch (error) {
    return createErrorResponse(500, error);
  }
}

async function createEntry(userId: string) {
  return await prisma.$transaction(async (tx) => {
    const { id, date } = await tx.journal.create({
      data: {
        userId,
        content: "",
        date: normalizeTime(new Date()),
      },
      select: { id: true, date: true },
    });

    await tx.analysis.create({
      data: {
        emoji: "",
        mood: "",
        subject: "",
        summery: "",
        entryId: id,
        date,
        userId,
      },
    });

    return id;
  });
}

function normalizeTime(date: Date) {
  return new Date(setMinutes(setHours(date, 5), 30));
}
