import { NextRequest } from "next/server";
import { z } from "zod";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { RequestContext } from "@/utils/types";
import { contextValidator, zodSafeParseValidator } from "@/utils/validator";
import { ErrorBody, jsonResponse } from "@/utils/apiResponse";

export async function PUT(request: NextRequest, context: RequestContext) {
  try {
    const { id } = zodSafeParseValidator(contextValidator(context));

    const { date } = zodSafeParseValidator(
      z.object({ date: z.string().datetime() }).safeParse(await request.json()),
    );

    try {
      const userId = await getUserIdByClerkId();

      try {
        await prisma.journal.update({
          where: { userId_id: { userId, id } },
          data: { date: new Date(date) },
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
