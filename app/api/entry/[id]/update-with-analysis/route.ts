import { NextRequest } from "next/server";
import { z } from "zod";
import { contentPreview } from "@/utils";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { RequestContext } from "@/utils/types";
import { contextValidator, parseValidatedData } from "@/utils/validator";
import { createErrorResponse, createJsonResponse } from "@/utils/response";

export async function PUT(request: NextRequest, context: RequestContext) {
  try {
    const { id } = parseValidatedData(contextValidator(context));

    const { content, analysis } = parseValidatedData(
      z
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
        .safeParse(await request.json()),
    );

    try {
      const userId = await getUserIdByClerkId();

      try {
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
      return createErrorResponse(401, error);
    }
  } catch (error) {
    return createErrorResponse(400, error);
  }
}
