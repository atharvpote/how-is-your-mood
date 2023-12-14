import { chat } from "@/utils/chat";
import { errorResponse } from "@/utils/error";
import { zodRequestValidator } from "@/utils/validator";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
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
      .safeParse(await request.json());

    const { conversation } = zodRequestValidator(validation);

    try {
      try {
        const reply = await chat(conversation);

        return NextResponse.json({ reply }, { status: 200 });
      } catch (error) {
        return errorResponse(error, 500);
      }
    } catch (error) {
      return errorResponse(error, 401);
    }
  } catch (error) {
    errorResponse(error, 400);
  }
}
