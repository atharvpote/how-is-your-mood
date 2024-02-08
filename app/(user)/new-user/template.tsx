import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import { prisma } from "@/utils/db";
import { EmailAddress } from "@clerk/nextjs/server";

export default async function NewUserTemplate() {
  const user = await currentUser();

  if (!user)
    throw new Error(" Authentication credentials were missing or incorrect");

  const { id: clerkId, emailAddresses } = user;

  if (!(await findCurrentUserInDB(clerkId)))
    await createNewUser(clerkId, emailAddresses);

  redirect("/journal");
}

async function findCurrentUserInDB(clerkId: string) {
  return await prisma.user.findUnique({ where: { clerkId } });
}

function getEmail(emailAddresses: EmailAddress[]) {
  if (!emailAddresses[0]?.emailAddress) throw new Error("Email is undefined");

  const [{ emailAddress: email }] = emailAddresses;

  return email;
}

async function createNewUser(clerkId: string, emailAddresses: EmailAddress[]) {
  return await prisma.user.create({
    data: { clerkId, email: getEmail(emailAddresses) },
  });
}
