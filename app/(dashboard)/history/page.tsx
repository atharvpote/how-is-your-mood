import { endOfWeek, startOfWeek } from "date-fns";
import HistoryDateRange from "@/components/HistoryDateRange";
import { GetStarted } from "@/components/alerts";
import HistoryChart from "@/components/chart";
import HistoryContextProvider from "@/contexts/history";
import { HistoryHeightFull } from "@/components/layouts";
import { ChartAnalysis } from "@/utils";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

export default async function History() {
  const userId = await getUserIdByClerkId();

  const mostRecent = await prisma.journal.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  let analyses: ChartAnalysis[] = [];

  if (mostRecent) {
    analyses = await prisma.analysis.findMany({
      where: {
        userId,
        AND: [
          { date: { gte: startOfWeek(mostRecent.date) } },
          { date: { lte: endOfWeek(mostRecent.date) } },
        ],
      },
      orderBy: { date: "asc" },
      select: { sentiment: true, date: true, mood: true, emoji: true },
    });
  }

  return (
    <>
      <div className="prose h-12 px-4 pt-4 md:prose-lg xl:pl-8">
        <h2>History</h2>
      </div>
      {mostRecent ? (
        <HistoryContextProvider initialRecent={mostRecent.date}>
          <div className="flex justify-center py-4">
            <div className="flex flex-col gap-2">
              <HistoryDateRange />
            </div>
          </div>
          <HistoryChart initialAnalyses={analyses} />
        </HistoryContextProvider>
      ) : (
        <HistoryHeightFull>
          <div>
            <GetStarted />
          </div>
        </HistoryHeightFull>
      )}
    </>
  );
}
