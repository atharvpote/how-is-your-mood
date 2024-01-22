import HistoryDateRange from "@/components/historyDateRange";
import { GetStarted } from "@/components/alerts";
import HistoryChart from "@/components/chart";
import HistoryContextProvider from "@/contexts/history";
import { HistoryHeightFull } from "@/components/layouts";
import { ChartAnalysis } from "@/utils/types";
import { getUserIdByClerkId } from "@/utils/auth";
import { fetchChatAnalysis, fetchMostRecentEntry } from "@/utils/fetcher";
import { endOfWeek, startOfWeek } from "date-fns";

export default async function History() {
  const userId = await getUserIdByClerkId();

  const mostRecent = await fetchMostRecentEntry(userId);

  let analyses: ChartAnalysis[] = [];

  if (mostRecent) {
    analyses = await fetchChatAnalysis(
      userId,
      startOfWeek(mostRecent.date),
      endOfWeek(mostRecent.date),
    );
  }

  return (
    <>
      <div className="prose h-12 px-4 pt-4 md:prose-lg xl:pl-8">
        <h2>History</h2>
      </div>
      <Content analyses={analyses} mostRecent={mostRecent} />
    </>
  );
}

function Content({
  mostRecent,
  analyses,
}: Readonly<{
  mostRecent: { date: Date } | null;
  analyses: ChartAnalysis[];
}>) {
  if (mostRecent) {
    return (
      <HistoryContextProvider initialMostRecent={mostRecent.date}>
        <div className="flex justify-center py-4">
          <div className="flex flex-col gap-2">
            <HistoryDateRange />
          </div>
        </div>
        <HistoryChart initialAnalyses={analyses} />
      </HistoryContextProvider>
    );
  }

  return (
    <HistoryHeightFull>
      <GetStarted />
    </HistoryHeightFull>
  );
}
