import { endOfWeek, startOfWeek } from "date-fns";
import HistoryChart, { ChartAnalysis } from "@/components/chart";
import GetStarted from "@/components/getStarted";
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
    <div className="flex h-0 min-h-[calc(100vh-5rem)] flex-col">
      <div className="prose mx-8 my-4 md:prose-lg">
        <h2>History</h2>
      </div>
      {mostRecentEntry ? (
        <HistoryChart mostRecent={mostRecentEntry.date} analyses={analyses} />
      ) : (
        <GetStarted />
      )}
    </div>
  );
}
