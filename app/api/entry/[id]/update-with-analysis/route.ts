import { NextRequest } from "next/server";
import { z } from "zod";
import { contentPreview } from "@/utils";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { RequestContext } from "@/utils/types";
import { contextValidator, zodSafeParseValidator } from "@/utils/validator";
import { ErrorBody, jsonResponse } from "@/utils/apiResponse";

export async function PUT(request: NextRequest, context: RequestContext) {
  try {
    const { id } = zodSafeParseValidator(contextValidator(context));

    const { content, analysis } = zodSafeParseValidator(
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
