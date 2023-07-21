import Editor from "@/components/editor";
import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

interface PropTypes {
  params: { id: string };
}

export default async function EntryPage({ params: { id } }: PropTypes) {
  const entry = await getEntry(id);

  if (!entry.analysis) throw new Error("Failed to fetch analysis");

  return <Editor entry={entry} analysis={entry.analysis} />;
}

async function getEntry(id: string) {
  const user = await getUserByClerkId();

  const entry = await prisma.journalEntry.findUniqueOrThrow({
    where: { userId_id: { userId: user.id, id } },
    include: { analysis: true },
  });

  return entry;
}
