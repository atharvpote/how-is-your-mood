import Editor from "@/components/editor";
import { Context, contextValidator, formatErrors } from "@/utils";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

export default async function EntryPage(context: Context) {
  const validation = contextValidator(context);

  if (!validation.success) throw new Error(formatErrors(validation.error));

  const userId = await getUserIdByClerkId();

  const { id } = validation.data;
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
        },
      },
    },
  });

  if (entry.analysis === null)
    throw new Error("NotFoundError: No Analysis found.");

  return (
    <div className="h-0 min-h-[calc(100vh-4rem)]">
      <Editor entry={entry} entryAnalysis={entry.analysis} />
    </div>
  );
}
