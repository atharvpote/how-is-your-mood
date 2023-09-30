import Editor from "@/components/editor";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

interface PropTypes {
  params: { id: string };
}

export default async function EntryPage({ params: { id } }: PropTypes) {
  const userId = await getUserIdByClerkId();

  const entry = await prisma.journal.findUniqueOrThrow({
    where: { userId_id: { userId, id } },
    select: {
      content: true,
      id: true,
      date: true,
      analysis: {
        select: {
          emoji: true,
          mood: true,
          sentiment: true,
          subject: true,
          summery: true,
          date: true,
        },
      },
    },
  });

  if (!entry.analysis) throw new Error("NotFoundError: No Analysis found.");

  return (
    <div className="h-0 min-h-[calc(100vh-4rem)]">
      <Editor entry={entry} entryAnalysis={entry.analysis} />
    </div>
  );
}
