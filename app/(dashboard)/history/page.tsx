import HistoryChart from "@/components/chart";
import { getMostRecentEntry } from "@/utils/server";

export default async function History() {
  const entry = await getMostRecentEntry();

  return (
    <div className="h-0 min-h-[calc(100vh-5rem)]">
      <div className="mx-8 my-4">
        <h2 className="text-3xl font-medium text-accent">History</h2>
      </div>
      {entry ? <HistoryChart mostRecentEntry={entry} /> : <div></div>}
    </div>
  );
}
