import { auth } from "@clerk/nextjs";
import { prisma } from "./db";

export async function getCurrentUserId() {
  const { userId: clerkId } = auth();

  if (!clerkId) throw new Error("Clerk ID not found.");

  const { id } = await prisma.user.findUniqueOrThrow({
    where: { clerkId },
    select: { id: true },
  });

  return id;
}
