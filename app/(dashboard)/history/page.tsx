import { endOfWeek, startOfWeek } from "date-fns";
import { getChartAnalyses, getMostRecentEntry } from "@/utils/actions";
import History from "@/components/client/history";
import { GetStarted } from "@/components/server/alerts";
import { HistoryFullHeight } from "@/components/server/layouts";
import { JournalSelect } from "@/drizzle/schema";

export default async function HistoryPage() {
  return (
    <>
      <div className="prose h-12 px-4 pt-4 md:prose-lg xl:pl-8">
        <h2>History</h2>
      </div>
      <HistoryComponent mostRecentEntry={await getMostRecentEntry()} />
    </>
  );
}

async function HistoryComponent({
  mostRecentEntry,
}: Readonly<{
  mostRecentEntry?: Pick<JournalSelect, "date">;
}>) {
  if (!mostRecentEntry)
    return (
      <HistoryFullHeight>
        <GetStarted />
      </HistoryFullHeight>
    );

  const analyses = await getChartAnalyses(
    startOfWeek(mostRecentEntry.date),
    endOfWeek(mostRecentEntry.date),
  );

  return (
    <History analyses={analyses} mostRecentEntryDate={mostRecentEntry.date} />
  );
}
