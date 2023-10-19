import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Analysis } from "@prisma/client";
import {
  RequestContext,
  contextValidator,
  errorResponse,
  formatErrors,
} from "@/utils";
import { getUserIdByClerkId } from "@/utils/auth";
import { analyze } from "@/utils/ai";
import { prisma } from "@/utils/db";

export async function GET(_: never, context: RequestContext) {
  try {
    const validation = contextValidator(context);

    if (!validation.success) throw new Error(formatErrors(validation.error));

    try {
      const userId = await getUserIdByClerkId();

      const { id } = validation.data;

      try {
        const { date, content, analysis } =
          await prisma.journal.findUniqueOrThrow({
            where: { userId_id: { userId, id } },
            select: {
              content: true,
              date: true,

              analysis: {
                select: {
                  emoji: true,
                  mood: true,
                  sentiment: true,
                  subject: true,
                  summery: true,
                },
              },
            },
          });

        if (!analysis) throw new Error("NotFoundError: No Analysis found.");

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

    if (!contextValidation.success)
      throw new Error(formatErrors(contextValidation.error));

    const requestValidation = z
      .object({ content: z.string() })
      .safeParse(await request.json());

    if (!requestValidation.success)
      throw new Error(formatErrors(requestValidation.error));

    const { content } = requestValidation.data;
    const { id } = contextValidation.data;

    try {
      const userId = await getUserIdByClerkId();

      try {
        await prisma.journal.update({
          where: { userId_id: { userId, id } },
          data: { content },
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

    if (!validation.success) throw new Error(formatErrors(validation.error));

    try {
      const userId = await getUserIdByClerkId();

      const { id } = validation.data;

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
