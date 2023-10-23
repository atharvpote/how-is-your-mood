import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { contentPreview } from "@/utils";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { errorResponse } from "@/utils/error";
import { RequestContext } from "@/utils/types";
import { contextValidator, zodRequestValidator } from "@/utils/validator";

export async function PUT(request: NextRequest, context: RequestContext) {
  try {
    const contextValidation = contextValidator(context);

    const { id } = zodRequestValidator(contextValidation);

    const requestValidation = z
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

    const { content, analysis } = zodRequestValidator(requestValidation);

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
