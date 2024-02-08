import { NextRequest } from "next/server";
import { StreamingTextResponse } from "ai";
import { z } from "zod";
import { createErrorResponse } from "@/utils/response";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { validatedData } from "@/utils/validator";
import { chat } from "@/utils/ai";

export async function POST(request: NextRequest) {
  try {
    const { messages } = validatedData(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum([
              "user",
              "assistant",
              "system",
              "data",
              "tool",
              "function",
            ]),
            content: z.string(),
          }),
        ),
      }),
      await request.json(),
    );

    try {
      const userId = await getUserIdByClerkId();

      return new StreamingTextResponse(
        await chat(
          messages,
          await prisma.journal.findMany({
            where: { userId },
          }),
        ),
      );
    } catch (error) {
      return createErrorResponse(500, error);
    }
  } catch (error) {
    return createErrorResponse(400, error);
  }
}
