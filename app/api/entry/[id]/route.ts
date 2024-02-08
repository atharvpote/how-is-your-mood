import { NextRequest } from "next/server";
import { z } from "zod";
import { createPreview, getRequestData } from "@/utils";
import { getCurrentUserId } from "@/utils/auth";
import { getAnalysis } from "@/utils/ai";
import { prisma } from "@/utils/db";
import { ANALYSIS_NOT_FOUND } from "@/utils/error";
import { Analysis, RequestContext } from "@/utils/types";
import { getEntryAndAnalysis } from "@/utils/fetchers";
import {
  validateRequestContext,
  validateNotNull,
  validatedData,
} from "@/utils/validator";
import { createErrorResponse, createJsonResponse } from "@/utils/response";

export async function GET(_: never, context: RequestContext) {
  try {
    const {
      params: { id },
    } = validateRequestContext(context);

    try {
      const { date, content, analysis } = await getEntryAndAnalysis({
        userId: await getCurrentUserId(),
        id,
      });

      validateNotNull<Analysis>(analysis, ANALYSIS_NOT_FOUND);

      return createJsonResponse(200, { date, content, analysis });
    } catch (error) {
      return createErrorResponse(500, error);
    }
  } catch (error) {
    return createErrorResponse(400, error);
  }
}

export async function PUT(request: NextRequest, context: RequestContext) {
  try {
    const {
      params: { id },
    } = validateRequestContext(context);
    const requestSchema = z.object({ content: z.string() });

    const { content } = validatedData(
      requestSchema,
      await getRequestData(request),
    );

    try {
      await updateJournal({ content, id });

      return createJsonResponse(200, {
        analysis: await updateAnalysis({ content, entryId: id }),
      });
    } catch (error) {
      return createErrorResponse(500, error);
    }
  } catch (error) {
    return createErrorResponse(400, error);
  }
}

async function updateJournal({ content, id }: { content: string; id: string }) {
  return await prisma.journal.update({
    where: { userId_id: { userId: await getCurrentUserId(), id } },
    data: { content, preview: createPreview(content) },
  });
}

async function updateAnalysis({
  content,
  entryId,
}: {
  entryId: string;
  content: string;
}) {
  return await prisma.analysis.update({
    where: { entryId },
    data: !content.trim()
      ? {
          emoji: "",
          mood: "",
          subject: "",
          summery: "",
          sentiment: 0,
        }
      : await getAnalysis(content),
    select: {
      emoji: true,
      mood: true,
      subject: true,
      summery: true,
      sentiment: true,
    },
  });
}

export async function DELETE(_: never, context: RequestContext) {
  try {
    const {
      params: { id },
    } = validateRequestContext(context);

    try {
      await prisma.journal.delete({
        where: { userId_id: { userId: await getCurrentUserId(), id } },
      });

      return createJsonResponse(200);
    } catch (error) {
      return createErrorResponse(500, error);
    }
  } catch (error) {
    return createErrorResponse(400, error);
  }
}
