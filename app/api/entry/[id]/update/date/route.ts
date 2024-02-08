import { NextRequest } from "next/server";
import { z } from "zod";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { IdParams } from "@/utils/types";
import { validateUrlIdParam, validatedData } from "@/utils/validator";
import { createErrorResponse, createJsonResponse } from "@/utils/response";

export async function PUT(
  request: NextRequest,
  { params }: { params: IdParams },
) {
  try {
    const { id } = validateUrlIdParam(params);

    const { date } = validatedData(
      z.object({ date: z.string().datetime() }),
      await request.json(),
    );

    try {
      const userId = await getUserIdByClerkId();

      await prisma.journal.update({
        where: { userId_id: { userId, id } },
        data: { date: new Date(date) },
      });

      return createJsonResponse(200);
    } catch (error) {
      return createErrorResponse(500, error);
    }
  } catch (error) {
    return createErrorResponse(400, error);
  }
}
