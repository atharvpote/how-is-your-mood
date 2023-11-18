import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Analysis } from "@prisma/client";
import { contentPreview } from "@/utils";
import { getUserIdByClerkId } from "@/utils/auth";
import { analyze } from "@/utils/ai";
import { prisma } from "@/utils/db";
import { errorResponse, analysisNotFound } from "@/utils/error";
import { EntryAnalysis, RequestContext } from "@/utils/types";
import { fetchEntryAndAnalysis } from "@/utils/fetcher";
import {
  contextValidator,
  notNullValidator,
  zodRequestValidator,
} from "@/utils/validator";

export async function GET(_: never, context: RequestContext) {
  try {
    const validation = contextValidator(context);

    const { id } = zodRequestValidator(validation);

    try {
      const userId = await getUserIdByClerkId();

      try {
        const { date, content, analysis } = await fetchEntryAndAnalysis(
          userId,
          id,
        );

        notNullValidator<EntryAnalysis>(analysis, analysisNotFound);

        return NextResponse.json({ date, content, analysis }, { status: 200 });
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

export async function PUT(request: NextRequest, context: RequestContext) {
  try {
    const contextValidation = contextValidator(context);

    const { id } = zodRequestValidator(contextValidation);

    const requestValidation = z
      .object({ content: z.string() })
      .safeParse(await request.json());

    const { content } = zodRequestValidator(requestValidation);

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

        return NextResponse.json({ analysis }, { status: 200 });
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

export async function DELETE(_: never, context: RequestContext) {
  try {
    const validation = contextValidator(context);

    const { id } = zodRequestValidator(validation);

    try {
      const userId = await getUserIdByClerkId();

      try {
        await prisma.journal.delete({
          where: { userId_id: { userId, id } },
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
