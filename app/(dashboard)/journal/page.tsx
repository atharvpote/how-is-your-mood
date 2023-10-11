import Entries from "@/components/entries";
import NewEntry from "@/components/newEntry";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

export default async function Journal() {
  const userId = await getUserIdByClerkId();

  const entries = await prisma.journal.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: { id: true, date: true, content: true },
  });

  return (
    <div className="h-0 min-h-[calc(100vh-4rem)]">
      <div className="h-0 min-h-full px-8 py-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="prose prose-sm md:prose-base">
            <h1>Journal</h1>
          </div>
          <NewEntry />
        </div>
        <Entries entries={entries} />
      </div>
    </div>
  );
}
