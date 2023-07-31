import HistoryChart from "@/components/historyChart";
import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";

export default function History() {
  return (
    <div className="">
      <div className="mx-4 mb-4 h-10 text-xl font-semibold">History</div>
      <HistoryChart />
    </div>
  );
}

// async function test() {
//   const data = await prisma.analysis.findMany({
//     where: { userId: (await getUserByClerkId()).id, week: 31 },
//   });
// }
