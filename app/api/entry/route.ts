import { NextResponse } from "next/server";
import { setHours, setMinutes } from "date-fns";
import { errorResponse } from "@/utils";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

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

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 401);
  }
}

function normalizeTime(date: Date) {
  return new Date(setMinutes(setHours(date, 5), 30));
}
