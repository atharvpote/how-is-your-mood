import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { errorResponse, updateContent, updateDate } from "@/utils/server";

interface ParamType {
  params: {
    id: string;
  };
}

export async function GET(_: Request, { params: { id } }: ParamType) {
  try {
    const userId = await getUserIdByClerkId();

    try {
      const { date } = await prisma.journal.findUniqueOrThrow({
        where: { userId_id: { userId, id } },
        select: { date: true },
      });

      return NextResponse.json({ date }, { status: 200 });
    } catch (error) {
      return errorResponse(error, 500);
    }
  } catch (error) {
    return errorResponse(error, 401);
  }
}

export async function PUT(request: Request, { params: { id } }: ParamType) {
  try {
    const data = z
      .union([
        z.object({ type: z.literal("content"), content: z.string() }),
        z.object({ type: z.literal("date"), date: z.string() }),
      ])
      .parse(await request.json());

    try {
      const userId = await getUserIdByClerkId();

      if (data.type === "date") {
        const { date } = data;

        return await updateDate(userId, id, new Date(date));
      }

      const { content } = data;

      return await updateContent(userId, id, content);
    } catch (error) {
      return errorResponse(error, 401);
    }
  } catch (error) {
    return errorResponse(error, 400);
  }
}

export async function DELETE(_: Request, { params: { id } }: ParamType) {
  try {
    const userId = await getUserIdByClerkId();

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
}
