import Entries from "@/components/entries";
import NewEntry from "@/components/newEntry";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

export default async function EntriesPage() {
  const userId = await getUserIdByClerkId();

  const entries = await prisma.journal.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: { id: true, date: true, preview: true },
  });

  return (
    <div className="px-4 xl:pl-8">
      <header className="flex items-center justify-between pt-4">
        <div className="prose md:prose-lg">
          <h2>Journal</h2>
        </div>
        <NewEntry />
      </header>
      <Entries initialEntries={entries} />
    </div>
  );
}
