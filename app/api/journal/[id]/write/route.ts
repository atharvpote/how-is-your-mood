import { z } from "zod";
import { errorResponse, formatErrors } from "@/utils/server";
import { getUserIdByClerkId } from "@/utils/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";

interface ParamType {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params: { id } }: ParamType) {
  try {
    const validation = z
      .object({
        content: z.string(),
        analysis: z.object({
          sentiment: z.number(),
          mood: z.string(),
          emoji: z.string(),
          subject: z.string(),
          summery: z.string(),
        }),
      })
      .safeParse(await request.json());

    if (!validation.success) throw new Error(formatErrors(validation.error));

    const { content, analysis } = validation.data;

    try {
      const userId = await getUserIdByClerkId();

      try {
        await prisma.journal.update({
          where: { userId_id: { userId, id } },
          data: { content },
        });

        await prisma.analysis.update({
          where: { entryId_userId: { entryId: id, userId } },
          data: analysis,
        });

        return NextResponse.json({ status: 200 });
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
