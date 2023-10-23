import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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
      .object({ date: z.string().datetime() })
      .safeParse(await request.json());

    const { date } = zodRequestValidator(requestValidation);

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
