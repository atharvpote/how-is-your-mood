import { auth } from "@clerk/nextjs";
import { prisma } from "./db";

export async function getUserIdByClerkId() {
  const { userId } = auth();

  if (userId === null)
    throw new Error("Authentication credentials were missing or incorrect");

  const { id } = await prisma.user.findUniqueOrThrow({
    where: { clerkId: userId },
    select: { id: true },
  });

  return id;
}
