import { NextRequest } from "next/server";
import { z } from "zod";
import { Analysis } from "@prisma/client";
import { contentPreview } from "@/utils";
import { getUserIdByClerkId } from "@/utils/auth";
import { analyze } from "@/utils/ai";
import { prisma } from "@/utils/db";
import { ANALYSIS_NOT_FOUND } from "@/utils/error";
import { EntryAnalysis, IdParams } from "@/utils/types";
import { fetchEntryAndAnalysis } from "@/utils/fetcher";
import {
  validateUrlIdParam,
  validateNotNull,
  validatedData,
} from "@/utils/validator";
import { createErrorResponse, createJsonResponse } from "@/utils/response";

export async function GET(_: never, { params }: { params: IdParams }) {
  try {
    const { id } = validateUrlIdParam(params);

    try {
      const userId = await getUserIdByClerkId();

      const { date, content, analysis } = await fetchEntryAndAnalysis(
        userId,
        id,
      );

      validateNotNull<EntryAnalysis>(analysis, ANALYSIS_NOT_FOUND);

      return createJsonResponse(200, { date, content, analysis });
    } catch (error) {
      return createErrorResponse(500, error);
    }
  } catch (error) {
    return createErrorResponse(400, error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: IdParams },
) {
  try {
    const { id } = validateUrlIdParam(params);

    const { content } = validatedData(
      z.object({ content: z.string() }),
      await request.json(),
    );

    try {
      const userId = await getUserIdByClerkId();

      await prisma.journal.update({
        where: { userId_id: { userId, id } },
        data: { content, preview: contentPreview(content) },
      });

      let analysis: Pick<
        Analysis,
        "emoji" | "mood" | "subject" | "summery" | "sentiment"
      >;

      const where = { entryId: id };
      const select = {
        emoji: true,
        mood: true,
        subject: true,
        summery: true,
        sentiment: true,
      };

      if (!content.trim())
        analysis = await prisma.analysis.update({
          where,
          data: {
            emoji: "",
            mood: "",
            subject: "",
            summery: "",
            sentiment: 0,
          },
          select,
        });
      else
        analysis = await prisma.analysis.update({
          where,
          data: await analyze(content),
          select,
        });

      return createJsonResponse(200, { analysis });
    } catch (error) {
      return createErrorResponse(500, error);
    }
  } catch (error) {
    return createErrorResponse(400, error);
  }
}

export async function DELETE(_: never, { params }: { params: IdParams }) {
  try {
    const { id } = validateUrlIdParam(params);

    try {
      const userId = await getUserIdByClerkId();

      await prisma.journal.delete({
        where: { userId_id: { userId, id } },
      });

      return createJsonResponse(200);
    } catch (error) {
      return createErrorResponse(500, error);
    }
  } catch (error) {
    return createErrorResponse(400, error);
  }
}
