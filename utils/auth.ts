import { auth } from "@clerk/nextjs";
import { prisma } from "./db";

export async function getUserIdByClerkId() {
  const { userId: clerkId } = auth();

  if (!clerkId)
    throw new Error("Authentication credentials were missing or incorrect");

  const { id } = await prisma.user.findUniqueOrThrow({
    where: { clerkId },
    select: { id: true },
  });

  return id;
}
