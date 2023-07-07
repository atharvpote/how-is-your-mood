import { NextResponse } from "next/server";
import { z } from "zod";
import { analyze } from "@/utils/ai";
import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { Analysis } from "@prisma/client";

interface ParamType {
  params: {
    id: string;
  };
}

export async function PATCH(request: Request, { params }: ParamType) {
  const requestData: unknown = await request.json();

  try {
    const validateRequestData = z.object({ content: z.string() });

    const { content } = validateRequestData.parse(requestData);

    const user = await getUserByClerkId();

    if (!user)
      throw new Error(
        `Did not get "Clerk User Object" from "getUsrByClerkId" at "/api/journal/${params.id}"`,
      );

    const updateEntry = await prisma.journalEntry.update({
      where: { userId_id: { userId: user.id, id: params.id } },
      data: { content: content },
    });

    let newAnalysis: Analysis;

    if (content.trim().length === 0)
      newAnalysis = await prisma.analysis.upsert({
        where: { entryId: updateEntry.id },
        create: {
          color: "",
          mood: "",
          negative: false,
          subject: "",
          summery: "",
          entryId: updateEntry.id,
        },
        update: {
          color: "",
          mood: "",
          negative: false,
          subject: "",
          summery: "",
        },
      });
    else {
      const analysis = await analyze(content);

      if (!analysis)
        throw new Error(
          `Did not get "OpenAI Analysis Object" from "analyze" at "/api/journal/${params.id}"`,
        );

      newAnalysis = await prisma.analysis.upsert({
        where: { entryId: updateEntry.id },
        create: {
          color: analysis.color,
          mood: analysis.mood,
          negative: analysis.negative,
          subject: analysis.subject,
          summery: analysis.summery,
          entryId: updateEntry.id,
        },
        update: {
          color: analysis.color,
          mood: analysis.mood,
          negative: analysis.negative,
          subject: analysis.subject,
          summery: analysis.summery,
        },
      });
    }

    return NextResponse.json({
      data: updateEntry,
      analysis: newAnalysis,
    });
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
  }
}
