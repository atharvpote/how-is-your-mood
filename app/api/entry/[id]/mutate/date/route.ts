import { NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { RequestContext } from "@/utils/types";
import { validateRequestContext, validatedData } from "@/utils/validator";
import { createErrorResponse, createJsonResponse } from "@/utils/response";
import { getRequestData } from "@/utils";

export async function PUT(request: NextRequest, context: RequestContext) {
  const requestSchema = z.object({ date: z.string().datetime() });

  try {
    const {
      params: { id },
    } = validateRequestContext(context);
    const { date } = validatedData(
      requestSchema,
      await getRequestData(request),
    );

    try {
      await updateDate(id, new Date(date));

      return createJsonResponse(200);
    } catch (error) {
      return createErrorResponse(500, error);
    }
  } catch (error) {
    return createErrorResponse(400, error);
  }
}

async function updateDate(id: string, date: Date) {
  await prisma.journal.update({
    where: { userId_id: { userId: await getCurrentUserId(), id } },
    data: { date: new Date(date) },
  });
}
