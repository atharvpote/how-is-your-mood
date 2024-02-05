import { NextRequest } from "next/server";
import { StreamingTextResponse } from "ai";
import { z } from "zod";
import { ErrorBody, jsonResponse } from "@/utils/apiResponse";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { zodSafeParseValidator } from "@/utils/validator";
import { chat } from "@/utils/ai";

export async function POST(request: NextRequest) {
  try {
    const { messages } = zodSafeParseValidator(
      z
        .object({
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
        })
        .safeParse(await request.json()),
    );
    try {
      const userId = await getUserIdByClerkId();

      try {
        return new StreamingTextResponse(
          await chat(
            messages,
            await prisma.journal.findMany({
              where: { userId },
            }),
          ),
        );
      } catch (error) {
        return jsonResponse(500, new ErrorBody(error));
      }
    } catch (error) {
      return jsonResponse(401, new ErrorBody(error));
    }
  } catch (error) {
    return jsonResponse(400, new ErrorBody(error));
  }
}
