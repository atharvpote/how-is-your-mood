import Entries from "@/components/client/entries";
import NewEntry from "@/components/client/newEntry";
import { getCurrentUserId } from "@/utils/auth";
import { getEntryList } from "@/utils/fetchers";

export default async function EntriesPage() {
  return (
    <div className="px-4 xl:pl-8">
      <header className="flex items-center justify-between pt-4">
        <div className="prose md:prose-lg">
          <h2>Journal</h2>
        </div>
        <NewEntry />
      </header>
      <Entries initialEntries={await getEntryList(await getCurrentUserId())} />
    </div>
  );
}
