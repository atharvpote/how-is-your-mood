import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { qa } from "@/utils/ai";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { errorResponse, formatErrors } from "@/utils";

export async function POST(request: NextRequest) {
  try {
    const validation = z
      .object({ question: z.string() })
      .safeParse(await request.json());

    if (!validation.success) throw new Error(formatErrors(validation.error));

    const { question } = validation.data;

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
        const answer = await qa(question, entries);

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
