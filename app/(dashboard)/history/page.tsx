import HistoryChart from "@/components/historyChart";
import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

export default async function History() {
  const data = await getData();

  if (!data)
    throw new Error(`Did not get "data" from "getData" at "/history}"`);

  return (
    <div className="h-full">
      <div className="h-10">Avg. Sentiment {data.average}</div>
      <div className="h-[calc(100vh-6rem)] px-4">
        <HistoryChart analyses={data.analyses} />
      </div>
    </div>
  );
}

async function getData() {
  const user = await getUserByClerkId();

  try {
    if (!user)
      throw new Error(
        `Did not get "Clerk User Object" from "getUserByClerkId" at "/history"`,
      );

    const analyses = await prisma.analysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    const sum = analyses.reduce(
      (accumulator, current) => accumulator + current.sentimentScore,
      0,
    );
    const average = Math.round(sum / analyses.length);

    return { analyses, average };
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
  }
}
