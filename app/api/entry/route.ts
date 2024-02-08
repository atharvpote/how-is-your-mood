import { setHours, setMinutes } from "date-fns";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { createErrorResponse, createJsonResponse } from "@/utils/response";

export async function POST() {
  try {
    const userId = await getUserIdByClerkId();

    try {
      const { id, date } = await prisma.journal.create({
        data: {
          userId,
          content: "",
          date: normalizeTime(new Date()),
        },
        select: { id: true, date: true },
      });

      await prisma.analysis.create({
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

      return createJsonResponse(201, { id });
    } catch (error) {
      return createErrorResponse(500, error);
    }
  } catch (error) {
    return createErrorResponse(401, error);
  }
}

function normalizeTime(date: Date) {
  return new Date(setMinutes(setHours(date, 5), 30));
}
