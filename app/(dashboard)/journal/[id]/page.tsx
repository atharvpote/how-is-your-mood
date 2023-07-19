import Editor from "@/components/editor";
import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

interface PropTypes {
  params: { id: string };
}

export default async function EntryPage({ params: { id } }: PropTypes) {
  const { entry, analysis } = await getEntry(id);

  return <Editor entry={entry} analysis={analysis} />;
}

async function getEntry(id: string) {
  const user = await getUserByClerkId();

  if (!user)
    throw new Error("Authentication credentials were missing or incorrect");

  const entry = await prisma.journalEntry.findUnique({
    where: { userId_id: { userId: user.id, id } },
  });

  if (!entry) throw new Error("Entry not found");

  const analysis = await prisma.analysis.findUnique({
    where: { entryId: entry.id },
  });

  if (!analysis) throw new Error("Analysis not found");

  return { entry, analysis };
}
