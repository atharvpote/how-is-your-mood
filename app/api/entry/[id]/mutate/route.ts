import { NextRequest } from "next/server";
import { z } from "zod";
import { createPreview, getRequestData } from "@/utils";
import { getCurrentUserId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { Analysis, RequestContext } from "@/utils/types";
import { validateRequestContext, validatedData } from "@/utils/validator";
import { createErrorResponse, createJsonResponse } from "@/utils/response";

export async function PUT(request: NextRequest, context: RequestContext) {
  const requestSchema = z.object({
    content: z.string(),
    analysis: z.object({
      sentiment: z.number(),
      mood: z.string(),
      emoji: z.string(),
      subject: z.string(),
      summery: z.string(),
    }),
  });

  try {
    const {
      params: { id },
    } = validateRequestContext(context);
    console.log(request);

    const { content, analysis } = validatedData(
      requestSchema,
      await getRequestData(request),
    );

    try {
      await mutateEntry({
        userId: await getCurrentUserId(),
        id,
        content,
        analysis,
      });

      return createJsonResponse(200);
    } catch (error) {
      return createErrorResponse(500, error);
    }
  } catch (error) {
    return createErrorResponse(400, error);
  }
}

async function mutateEntry({
  analysis,
  content,
  userId,
  id,
}: {
  userId: string;
  id: string;
  content: string;
  analysis: Analysis;
}) {
  await prisma.$transaction(async (tx) => {
    await tx.journal.update({
      where: { userId_id: { userId, id } },
      data: { content, preview: createPreview(content) },
    });

    await tx.analysis.update({
      where: { entryId_userId: { entryId: id, userId } },
      data: analysis,
    });
  });
}
