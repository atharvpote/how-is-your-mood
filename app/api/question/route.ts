import { qa } from "@/utils/ai";
import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { errorResponse } from "@/utils/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  const requestData: unknown = await request.json();

  try {
    const data = z.object({ question: z.string() }).parse(requestData);

    try {
      const user = await getUserByClerkId();

      const entries = await prisma.journal.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          createdAt: true,
          content: true,
        },
      });

      if (!entries.length)
        return NextResponse.json(
          { message: "No matching records found" },
          { status: 500 },
        );

      try {
        const answer = await qa(data.question, entries);

        return NextResponse.json({ data: answer }, { status: 200 });
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
