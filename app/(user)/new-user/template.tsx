import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import { EmailAddress } from "@clerk/nextjs/server";
import { db } from "@/drizzle/db";
import { user } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

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
  const [userSelect] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.clerkId, clerkId))
    .limit(1);

  return userSelect;
}

async function createNewUser(clerkId: string, emailAddresses: EmailAddress[]) {
  return await db
    .insert(user)
    .values({ clerkId, email: getEmail(emailAddresses) });
}

function getEmail(emailAddresses: EmailAddress[]) {
  if (!emailAddresses[0]?.emailAddress) throw new Error("Email is undefined");

  const [{ emailAddress: email }] = emailAddresses;

  return email;
}
