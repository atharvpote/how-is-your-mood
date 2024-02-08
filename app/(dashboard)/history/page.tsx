import History from "@/components/client/history";
import { GetStarted } from "@/components/server/alerts";
import { HistoryFullHeight } from "@/components/server/layouts";
import { getCurrentUserId } from "@/utils/auth";
import { getAnalysis, getMostRecentEntryDate } from "@/utils/fetchers";
import { endOfWeek, startOfWeek } from "date-fns";

export default async function HistoryPage() {
  const userId = await getCurrentUserId();

  return (
    <>
      <div className="prose h-12 px-4 pt-4 md:prose-lg xl:pl-8">
        <h2>History</h2>
      </div>
      <HistoryComponent
        userId={userId}
        mostRecentEntryDate={await getMostRecentEntryDate(userId)}
      />
    </>
  );
}

async function HistoryComponent({
  mostRecentEntryDate,
  userId,
}: Readonly<{
  mostRecentEntryDate?: Date;
  userId: string;
}>) {
  if (!mostRecentEntryDate)
    return (
      <HistoryFullHeight>
        <GetStarted />
      </HistoryFullHeight>
    );

  return (
    <History
      initialAnalyses={await getAnalysis({
        userId,
        start: startOfWeek(mostRecentEntryDate),
        end: endOfWeek(mostRecentEntryDate),
      })}
      initialMostRecent={mostRecentEntryDate}
    />
  );
}
