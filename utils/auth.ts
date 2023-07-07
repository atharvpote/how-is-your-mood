import { auth } from "@clerk/nextjs";
import { prisma } from "./db";

export async function getUserByClerkId() {
  const { userId } = auth();

  try {
    if (!userId)
      throw new Error(
        `Did not get the "Clerk User" from "auth" at "getUserByClerkId"`,
      );

    const user = await prisma.user.findUniqueOrThrow({
      where: { clerkId: userId },
    });

    return user;
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
  }
}
