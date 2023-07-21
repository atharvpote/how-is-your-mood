import { auth } from "@clerk/nextjs";
import { prisma } from "./db";

export async function getUserByClerkId() {
  const { userId } = auth();

  if (!userId)
    throw new Error("Authentication credentials were missing or incorrect");

  const user = await prisma.user.findUniqueOrThrow({
    where: { clerkId: userId },
  });

  return user;
}
