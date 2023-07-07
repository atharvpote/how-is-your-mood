import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const requestData: unknown = await request.json();

  try {
    validateRequestData(requestData);

    const user = await getUserByClerkId();

    if (user) {
      const updateEntry = await prisma.journalEntry.update({
        where: { userId_id: { userId: user.id, id: params.id } },
        data: { content: requestData.content },
      });

      return NextResponse.json({ data: updateEntry });
    }
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
  }
}

function validateRequestData(
  requestData: unknown,
): asserts requestData is { content: string } {
  if (
    !(
      requestData &&
      typeof requestData === "object" &&
      "content" in requestData
    )
  )
    throw new Error("Invalid content data");
}
