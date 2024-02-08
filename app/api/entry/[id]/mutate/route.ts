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
      const userId = await getCurrentUserId();

      await updateJournal(userId, id, content);
      await updateAnalysis(userId, id, analysis);

      return createJsonResponse(200);
    } catch (error) {
      return createErrorResponse(500, error);
    }
  } catch (error) {
    return createErrorResponse(400, error);
  }
}

async function updateJournal(userId: string, id: string, content: string) {
  await prisma.journal.update({
    where: { userId_id: { userId, id } },
    data: { content, preview: createPreview(content) },
  });
}

async function updateAnalysis(userId: string, id: string, analysis: Analysis) {
  await prisma.analysis.update({
    where: { entryId_userId: { entryId: id, userId } },
    data: analysis,
  });
}
