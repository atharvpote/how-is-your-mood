import { NextRequest } from "next/server";
import { StreamingTextResponse } from "ai";
import { z } from "zod";
import { createErrorResponse } from "@/utils/response";
import { validatedData } from "@/utils/validator";
import { getChatResponse } from "@/utils/ai";
import { getCurrentUserId } from "@/utils/auth";

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
    const userId = await getCurrentUserId();

    const { messages } = validatedData(requestSchema, await request.json());

    try {
      return new StreamingTextResponse(await getChatResponse(messages, userId));
    } catch (error) {
      return createErrorResponse(500, error);
    }
  } catch (error) {
    return createErrorResponse(400, error);
  }
}
