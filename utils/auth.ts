import { auth } from "@clerk/nextjs";
import { prisma } from "./db";

export async function getUserByClerkId() {
  const { userId } = auth();

  if (userId)
    try {
      const user = await prisma.user.findUniqueOrThrow({
        where: { clerkId: userId },
      });

      return user;
    } catch (error: unknown) {
      if (error instanceof Error) console.error(error.message);
    }
}
