import { getJournalEntries } from "@/utils/actions";
import Entries from "@/components/client/entries";
import NewEntry from "@/components/client/newEntry";

export default async function EntriesPage() {
  return (
    <div className="px-4 xl:pl-8">
      <header className="flex items-center justify-between pt-4">
        <div className="prose md:prose-lg">
          <h2>Journal</h2>
        </div>
        <NewEntry />
      </header>
      <Entries entries={await getJournalEntries()} />
    </div>
  );
}
