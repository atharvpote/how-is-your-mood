import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  RequestContext,
  contextValidator,
  errorResponse,
  formatErrors,
} from "@/utils";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

export async function PUT(request: NextRequest, context: RequestContext) {
  try {
    const contextValidation = contextValidator(context);

    if (!contextValidation.success)
      throw new Error(formatErrors(contextValidation.error));

    const requestValidation = z
      .object({ date: z.string().datetime() })
      .safeParse(await request.json());

    if (!requestValidation.success)
      throw new Error(formatErrors(requestValidation.error));

    const { date } = requestValidation.data;
    const { id } = contextValidation.data;

    try {
      const userId = await getUserIdByClerkId();

      try {
        await prisma.journal.update({
          where: { userId_id: { userId, id } },
          data: { date: new Date(date) },
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
