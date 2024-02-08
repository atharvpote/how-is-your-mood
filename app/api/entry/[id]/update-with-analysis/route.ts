import { NextRequest } from "next/server";
import { z } from "zod";
import { contentPreview } from "@/utils";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { IdParams } from "@/utils/types";
import { validateUrlIdParam, validatedData } from "@/utils/validator";
import { createErrorResponse, createJsonResponse } from "@/utils/response";

export async function PUT(
  request: NextRequest,
  { params }: { params: IdParams },
) {
  try {
    const { id } = validateUrlIdParam(params);

    const { content, analysis } = validatedData(
      z.object({
        content: z.string(),
        analysis: z.object({
          sentiment: z.number(),
          mood: z.string(),
          emoji: z.string(),
          subject: z.string(),
          summery: z.string(),
        }),
      }),
      await request.json(),
    );

    try {
      const userId = await getUserIdByClerkId();

      await prisma.journal.update({
        where: { userId_id: { userId, id } },
        data: { content, preview: contentPreview(content) },
      });

      await prisma.analysis.update({
        where: { entryId_userId: { entryId: id, userId } },
        data: analysis,
      });

      return createJsonResponse(200);
    } catch (error) {
      return createErrorResponse(500, error);
    }
  } catch (error) {
    return createErrorResponse(400, error);
  }
}
