import Editor from "@/components/editor";
import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

interface PropTypes {
  params: { id: string };
}

export default async function EntryPage({ params: { id } }: PropTypes) {
  const entry = await getEntry(id);

  return (
    <>{entry?.analysis && <Editor entry={entry} analysis={entry.analysis} />}</>
  );
}

async function getEntry(id: string) {
  const user = await getUserByClerkId();

  try {
    if (!user)
      throw new Error(
        `Did not get "Clerk User Object" from "getUserByClerkId" at "/journal/${id}"`,
      );

    const entry = await prisma.journalEntry.findUnique({
      where: { userId_id: { userId: user.id, id: id } },
      include: { analysis: true },
    });

    return entry;
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
  }
}
