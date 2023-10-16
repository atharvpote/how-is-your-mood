import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, formatErrors, setTimeToMidnight } from "@/utils";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

interface ParamType {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params: { id } }: ParamType) {
  try {
    const validation = z
      .object({ date: z.string().datetime() })
      .safeParse(await request.json());

    if (!validation.success) throw new Error(formatErrors(validation.error));

    const { date } = validation.data;

    try {
      const userId = await getUserIdByClerkId();

      try {
        await prisma.journal.update({
          where: { userId_id: { userId, id } },
          data: { date: setTimeToMidnight(new Date(date)) },
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
