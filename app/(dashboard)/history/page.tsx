import { endOfWeek, startOfWeek } from "date-fns";
import { getChartAnalyses, getMostRecentEntryDate } from "@/utils/actions";
import History from "@/components/client/history";
import { GetStarted } from "@/components/server/alerts";
import { HistoryFullHeight } from "@/components/server/layouts";

export default async function HistoryPage() {
  return (
    <>
      <div className="prose h-12 px-4 pt-4 md:prose-lg xl:pl-8">
        <h2>History</h2>
      </div>
      <HistoryComponent mostRecentEntryDate={await getMostRecentEntryDate()} />
    </>
  );
}

async function HistoryComponent({
  mostRecentEntryDate,
}: Readonly<{
  mostRecentEntryDate?: string;
}>) {
  if (!mostRecentEntryDate)
    return (
      <HistoryFullHeight>
        <GetStarted />
      </HistoryFullHeight>
    );

  const analyses = await getChartAnalyses(
    startOfWeek(mostRecentEntryDate),
    endOfWeek(mostRecentEntryDate),
  );

  return <History analyses={analyses} recentEntryDate={mostRecentEntryDate} />;
}
