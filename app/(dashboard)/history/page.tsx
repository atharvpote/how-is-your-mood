import History from "@/components/history";
import { GetStarted } from "@/components/alerts";
import { HistoryHeightFull } from "@/components/layouts";
import { getUserIdByClerkId } from "@/utils/auth";
import { fetchChatAnalysis, fetchMostRecentEntry } from "@/utils/fetcher";
import { endOfWeek, startOfWeek } from "date-fns";

export default async function HistoryPage() {
  const userId = await getUserIdByClerkId();
  const mostRecent = await fetchMostRecentEntry(userId);

  return (
    <>
      <div className="prose h-12 px-4 pt-4 md:prose-lg xl:pl-8">
        <h2>History</h2>
      </div>
      <Content userId={userId} mostRecent={mostRecent} />
    </>
  );
}

async function Content({
  mostRecent,
  userId,
}: Readonly<{
  mostRecent: { date: Date } | null;
  userId: string;
}>) {
  if (!mostRecent)
    return (
      <HistoryHeightFull>
        <GetStarted />
      </HistoryHeightFull>
    );

  const analyses = await fetchChatAnalysis(
    userId,
    startOfWeek(mostRecent.date),
    endOfWeek(mostRecent.date),
  );

  return (
    <History initialAnalyses={analyses} initialMostRecent={mostRecent.date} />
  );
}
