import { setHours, setMinutes } from "date-fns";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { ErrorBody, jsonResponse } from "@/utils/apiResponse";

export async function POST() {
  try {
    const userId = await getUserIdByClerkId();

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

    return jsonResponse(201, { id });
  } catch (error) {
    return jsonResponse(401, new ErrorBody(error));
  }
}

function normalizeTime(date: Date) {
  return new Date(setMinutes(setHours(date, 5), 30));
}
