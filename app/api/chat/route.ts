import { NextRequest } from "next/server";
import { StreamingTextResponse } from "ai";
import { z } from "zod";
import { createErrorResponse } from "@/utils/response";
import { getCurrentUserId } from "@/utils/auth";
import { validatedData } from "@/utils/validator";
import { getChatResponse } from "@/utils/ai";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { journal } from "@/drizzle/schema";

export async function POST(request: NextRequest) {
  const requestSchema = z.object({
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
  });

  try {
    const { messages } = validatedData(requestSchema, await request.json());

    try {
      return new StreamingTextResponse(
        await getChatResponse(messages, await getEntries()),
      );
    } catch (error) {
      return createErrorResponse(500, error);
    }
  } catch (error) {
    return createErrorResponse(400, error);
  }
}

async function getEntries() {
  const entries = await db
    .select()
    .from(journal)
    .where(eq(journal.userId, await getCurrentUserId()));

  return entries;
}
