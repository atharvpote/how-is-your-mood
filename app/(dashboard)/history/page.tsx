import HistoryChart from "@/components/historyChart";
import { prisma } from "@/utils/db";
import { getUserByClerkId } from "@/utils/auth";

export default async function History() {
  const data = await getData();

  const analyses = data.analyses.map((analysis) => ({
    Date: analysis.entryDate,
    Sentiment: analysis.sentimentScore,
    Mood: analysis.mood,
    Emoji: analysis.emoji,
  }));

  return (
    <div className="h-full">
      <div className="h-10">Avg. Sentiment {data.average}</div>
      <div className="h-[calc(100vh-6rem)] px-4">
        <HistoryChart analyses={analyses} />
      </div>
    </div>
  );
}

async function getData() {
  const user = await getUserByClerkId();

  const analyses = await prisma.analysis.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  if (analyses.length === 0) throw new Error("No matching records found");

  const sum = analyses.reduce(
    (accumulator, current) => accumulator + current.sentimentScore,
    0,
  );

  const average = Math.round(sum / analyses.length);

  return { analyses, average };
}
