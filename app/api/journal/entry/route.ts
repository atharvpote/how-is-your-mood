import { NextResponse } from "next/server";
import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { Analysis, JournalEntry } from "@prisma/client";

export async function GET() {
  const user = await getUserByClerkId();

  if (!user)
    return NextResponse.json(
      {
        message: "Authentication credentials were missing or incorrect",
      },
      { status: 401 },
    );

  const entries = await prisma.journalEntry.findMany({
    where: { userId: user.id },
    orderBy: { entryDate: "desc" },
  });

  return NextResponse.json({ entries }, { status: 200 });
}

export async function POST() {
  const user = await getUserByClerkId();

  if (!user)
    return NextResponse.json(
      {
        message: "Authentication credentials were missing or incorrect",
      },
      { status: 401 },
    );

  const { entry, analysis } = (await createEntry()) as {
    entry: JournalEntry;
    analysis: Analysis;
  };

  return NextResponse.json(
    {
      entry,
      analysis,
    },
    { status: 201 },
  );
}

export async function createEntry() {
  const user = await getUserByClerkId();

  if (!user) throw new Error("Clerk user not found");

  const entry = await prisma.journalEntry.create({
    data: {
      userId: user.id,
      content: "",
    },
  });

  const analysis = await prisma.analysis.create({
    data: {
      color: "",
      mood: "",
      subject: "",
      summery: "",
      entryId: entry.id,
      userId: user.id,
    },
  });

  return { entry, analysis };
}
