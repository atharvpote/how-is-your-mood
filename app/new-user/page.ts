import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import { prisma } from "@/utils/db";

export default async function CreateNewUser() {
  const user = await currentUser();

  if (!user)
    throw new Error(" Authentication credentials were missing or incorrect");

  const match = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: {},
  });

  if (!match)
    await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
      },
    });

  redirect("/journal");
}
