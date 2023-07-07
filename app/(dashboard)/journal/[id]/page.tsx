import Editor from "@/components/editor";
import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

interface PropTypes {
  params: { id: string };
}

export default async function EntryPage({ params: { id } }: PropTypes) {
  const entry = await getEntry(id);

  return <>{entry && <Editor entry={entry} />}</>;
}

async function getEntry(id: string) {
  const user = await getUserByClerkId();

  if (user) {
    const entry = await prisma.journalEntry.findUnique({
      where: { userId_id: { userId: user.id, id: id } },
    });

    return entry;
  }
}
