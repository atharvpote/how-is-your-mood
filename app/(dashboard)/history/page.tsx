import HistoryChart from "@/components/historyChart";
import { prisma } from "@/utils/db";
import { getUserByClerkId } from "@/utils/auth";

export default async function History() {
  const data = await getData();

  const analyses = data.analyses.map((analysis) => ({
    date: new Date(analysis.entryDate.toDateString()).toLocaleDateString(
      "en-us",
      {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    ),
    sentiment: analysis.sentimentScore,
    mood: analysis.mood,
    emoji: analysis.emoji,
  }));

  return (
    <div className="h-full">
      <div className="mx-4 mb-4 h-10 text-xl font-semibold">
        Average Sentiment - {data.average}
      </div>
      <div className="h-[calc(100vh-7rem)] px-4">
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
