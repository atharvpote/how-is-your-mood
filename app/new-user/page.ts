import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import { prisma } from "@/utils/db";

import type { User } from "@prisma/client";
import type { User as ClerkUser } from "@clerk/nextjs/dist/types/server";

export default async function CreateNewUser(): Promise<void> {
  const user: ClerkUser | null = await currentUser();

  if (user) {
    const match: User | null = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!match)
      await prisma.user.create({
        data: { clerkId: user.id, email: user.emailAddresses[0].emailAddress },
      });

    redirect("/journal");
  }
}
