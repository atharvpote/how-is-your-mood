import { NextRequest } from "next/server";
import { z } from "zod";
import { getUserIdByClerkId } from "@/utils/auth";
import { chat } from "@/utils/ai";
import { prisma } from "@/utils/db";
import { zodSafeParseValidator } from "@/utils/validator";
import { ErrorBody, jsonResponse } from "@/utils/apiResponse";

export async function POST(request: NextRequest) {
  const data: unknown = await request.json();

  try {
    const validation = z
      .object({
        conversation: z
          .object({
            role: z.union([z.literal("user"), z.literal("ai")]),
            message: z.string(),
          })
          .array(),
      })
      .safeParse(data);

    const { conversation } = zodSafeParseValidator(validation);

    try {
      const userId = await getUserIdByClerkId();

      try {
        const entries = await prisma.journal.findMany({ where: { userId } });

        const reply = await chat(conversation, entries);

        return jsonResponse(200, { reply });
      } catch (error) {
        return jsonResponse(500, new ErrorBody(error));
      }
    } catch (error) {
      return jsonResponse(401, new ErrorBody(error));
    }
  } catch (error) {
    jsonResponse(400, new ErrorBody(error));
  }
}
