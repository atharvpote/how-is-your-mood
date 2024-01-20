import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import { prisma } from "@/utils/db";

export default async function NewUserTemplate() {
  const user = await currentUser();

  if (!user) {
    throw new Error(" Authentication credentials were missing or incorrect");
  }

  const { id: clerkId, emailAddresses } = user;

  const match = await prisma.user.findUnique({ where: { clerkId } });

  if (!emailAddresses[0]?.emailAddress) {
    throw new Error("Email is undefined");
  }

  const [{ emailAddress: email }] = emailAddresses;

  if (!match) {
    await prisma.user.create({ data: { clerkId, email } });
  }

  redirect("/journal");
}
