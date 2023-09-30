import HistoryChart from "@/components/chart";
import { getUserIdByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

export default async function History() {
  const userId = await getUserIdByClerkId();
  const mostRecentEntry = await prisma.journal.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  return (
    <div className="flex h-0 min-h-[calc(100vh-5rem)] flex-col">
      <div className="prose prose-sm mx-8 my-4 md:prose-base">
        <h1>History</h1>
      </div>
      {mostRecentEntry ? (
        <HistoryChart mostRecentEntry={mostRecentEntry.date} />
      ) : (
        <div className="grid basis-full place-content-center">
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 w-6 shrink-0 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Get started by creating your first entry</span>
          </div>
        </div>
      )}
    </div>
  );
}
