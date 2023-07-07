import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import NewEntryCard from "@/components/newEntryCard";
import EntryCard from "@/components/entryCard";
import Link from "next/link";

export default async function Journal() {
  const entries = await getEntries();

  return (
    <div className="p-10 bg-zinc-400/10 h-[calc(100vh-3.5rem)]">
      <h2 className="text-3xl mb-8">Journal</h2>
      <div className="grid grid-cols-3 gap-4">
        <NewEntryCard />
        {entries?.map((entry) => (
          <Link href={`/journal/${entry.id}`} key={entry.id}>
            <EntryCard entry={entry} />
          </Link>
        ))}
      </div>
    </div>
  );
}

async function getEntries() {
  const user = await getUserByClerkId();

  if (user) {
    const entries = await prisma.journalEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return entries;
  }
}
