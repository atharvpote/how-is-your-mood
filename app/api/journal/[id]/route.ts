import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { errorResponse, formatErrors } from "@/utils/server";
import { analyze } from "@/utils/ai";
import { Analysis } from "@prisma/client";

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
    const validation = z
      .object({ content: z.string() })
      .safeParse(await request.json());

    if (!validation.success) throw new Error(formatErrors(validation.error));

    const { content } = validation.data;

    try {
      const userId = await getUserIdByClerkId();

      try {
        await prisma.journal.update({
          where: { userId_id: { userId, id } },
          data: { content },
        });

        let analysis: Pick<
          Analysis,
          "emoji" | "mood" | "subject" | "summery" | "sentiment"
        >;

        const where = { entryId: id };
        const select = {
          emoji: true,
          mood: true,
          subject: true,
          summery: true,
          sentiment: true,
        };

        if (content.trim().length === 0)
          analysis = await prisma.analysis.update({
            where,
            data: {
              emoji: "",
              mood: "",
              subject: "",
              summery: "",
              sentiment: 0,
            },
            select,
          });
        else
          analysis = await prisma.analysis.update({
            where,
            data: await analyze(content),
            select,
          });

        return NextResponse.json({ analysis }, { status: 200 });
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
