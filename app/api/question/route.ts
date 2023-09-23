import { NextResponse } from "next/server";
import { z } from "zod";
import { qa } from "@/utils/ai";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { errorResponse } from "@/utils/server";

export async function POST(request: Request) {
  const requestData: unknown = await request.json();

  try {
    const data = z.object({ question: z.string() }).parse(requestData);

    try {
      const userId = await getUserIdByClerkId();

      const entries = await prisma.journal.findMany({
        where: { userId },
        select: {
          id: true,
          createdAt: true,
          content: true,
        },
      });

      try {
        const answer = await qa(data.question, entries);

        return NextResponse.json({ answer }, { status: 200 });
      } catch (error) {
        return errorResponse(error, 500);
      }
    } catch (error) {
      return errorResponse(error, 401);
    }
  } catch (error) {
    return errorResponse(error, 400);
  }
}
