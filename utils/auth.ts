import { db } from "@/drizzle/db";
import { user } from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function getCurrentUserId() {
  const { userId: clerkId } = auth();

  if (!clerkId) throw new Error("Clerk ID not found.");

  const [userSelect] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.clerkId, clerkId))
    .limit(1);

  if (!userSelect) throw new Error("User ID not found.");

  return userSelect.id;
}
