import Entries from "@/components/entries";
import NewEntryButton from "@/components/newEntryButton";
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
    <div className="p-4 xl:pl-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="prose md:prose-lg">
          <h2>Journal</h2>
        </div>
        <NewEntryButton />
      </div>
      <Entries entries={entries} />
    </div>
  );
}
