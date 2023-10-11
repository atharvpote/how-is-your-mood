import HistoryChart, { ChartAnalysis } from "@/components/chart";
import GetStarted from "@/components/getStarted";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { endOfWeek, startOfWeek } from "date-fns";

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
      <div className="prose prose-sm mx-8 my-4 md:prose-base">
        <h1>History</h1>
      </div>
      {mostRecentEntry ? (
        <HistoryChart
          mostRecentEntry={mostRecentEntry.date}
          analyses={analyses}
        />
      ) : (
        <GetStarted />
      )}
    </div>
  );
}
