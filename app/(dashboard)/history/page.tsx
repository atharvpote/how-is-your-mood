import { endOfWeek, startOfWeek } from "date-fns";
import { GetStarted } from "@/components/alerts";
import HistoryChart, { ChartAnalysis } from "@/components/chart";
import { HistoryHeightFull } from "@/components/layouts";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

export default async function History() {
  const userId = await getUserIdByClerkId();

  const mostRecentEntry = await prisma.journal.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  let analyses: ChartAnalysis[] = [];

  if (mostRecentEntry) {
    analyses = await prisma.analysis.findMany({
      where: {
        userId,
        AND: [
          { date: { gte: startOfWeek(mostRecentEntry.date) } },
          { date: { lte: endOfWeek(mostRecentEntry.date) } },
        ],
      },
      orderBy: { date: "asc" },
      select: { sentiment: true, date: true, mood: true, emoji: true },
    });
  }

  return (
    <div className="px-4 xl:pl-8">
      <div className="prose h-12 pt-4 md:prose-lg">
        <h2>History</h2>
      </div>
      {mostRecentEntry ? (
        <HistoryChart mostRecent={mostRecentEntry.date} analyses={analyses} />
      ) : (
        <HistoryHeightFull>
          <div>
            <GetStarted />
          </div>
        </HistoryHeightFull>
      )}
    </div>
  );
}
