import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import { prisma } from "@/utils/db";

export default async function CreateNewUser() {
  const user = await currentUser();

  try {
    if (!user)
      throw new Error(
        `Did not get the "Clerk User" from "currentUser" at "/new-user`,
      );

    const match = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!match)
      await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0].emailAddress,
        },
      });
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
  } finally {
    redirect("/journal");
  }
}
