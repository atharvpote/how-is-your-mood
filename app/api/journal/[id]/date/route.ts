import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { errorResponse } from "@/utils/server";
import { NextResponse } from "next/server";
import { z } from "zod";

interface ParamType {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params: { id } }: ParamType) {
  try {
    const { date } = z
      .object({ date: z.string().datetime() })
      .parse(await request.json());

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
