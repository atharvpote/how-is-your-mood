import { NextRequest } from "next/server";
import { z } from "zod";
import { Analysis } from "@prisma/client";
import { contentPreview } from "@/utils";
import { getUserIdByClerkId } from "@/utils/auth";
import { analyze } from "@/utils/ai";
import { prisma } from "@/utils/db";
import { analysisNotFound } from "@/utils/error";
import { EntryAnalysis, RequestContext } from "@/utils/types";
import { fetchEntryAndAnalysis } from "@/utils/fetcher";
import {
  contextValidator,
  notNullValidator,
  zodSafeParseValidator,
} from "@/utils/validator";
import { ErrorBody, jsonResponse } from "@/utils/apiResponse";

export async function GET(_: never, context: RequestContext) {
  try {
    const validation = contextValidator(context);

    const { id } = zodSafeParseValidator(validation);

    try {
      const userId = await getUserIdByClerkId();

      try {
        const { date, content, analysis } = await fetchEntryAndAnalysis(
          userId,
          id,
        );

        notNullValidator<EntryAnalysis>(analysis, analysisNotFound);

        return jsonResponse(200, { date, content, analysis });
      } catch (error) {
        return jsonResponse(500, new ErrorBody(error));
      }
    } catch (error) {
      return jsonResponse(401, new ErrorBody(error));
    }
  } catch (error) {
    return jsonResponse(400, new ErrorBody(error));
  }
}

export async function PUT(request: NextRequest, context: RequestContext) {
  const data: unknown = await request.json();

  try {
    const contextValidation = contextValidator(context);

    const { id } = zodSafeParseValidator(contextValidation);

    const requestValidation = z.object({ content: z.string() }).safeParse(data);

    const { content } = zodSafeParseValidator(requestValidation);

    try {
      const userId = await getUserIdByClerkId();

      try {
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

        if (!content.trim()) {
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
        } else {
          analysis = await prisma.analysis.update({
            where,
            data: await analyze(content),
            select,
          });
        }

        return jsonResponse(200, { analysis });
      } catch (error) {
        return jsonResponse(500, new ErrorBody(error));
      }
    } catch (error) {
      return jsonResponse(401, new ErrorBody(error));
    }
  } catch (error) {
    return jsonResponse(400, new ErrorBody(error));
  }
}

export async function DELETE(_: never, context: RequestContext) {
  try {
    const validation = contextValidator(context);

    const { id } = zodSafeParseValidator(validation);

    try {
      const userId = await getUserIdByClerkId();

      try {
        await prisma.journal.delete({
          where: { userId_id: { userId, id } },
        });

        return jsonResponse(200);
      } catch (error) {
        return jsonResponse(500, new ErrorBody(error));
      }
    } catch (error) {
      return jsonResponse(401, new ErrorBody(error));
    }
  } catch (error) {
    return jsonResponse(400, new ErrorBody(error));
  }
}
