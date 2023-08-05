import Entries from "@/components/entries";
import NewEntry from "@/components/newEntry";

export default function Journal() {
  return (
    <div className="h-0 min-h-[calc(100vh-4rem)]">
      <div className="h-0 min-h-full px-8 py-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-medium text-accent">Journal</h2>
          <NewEntry />
        </div>
        <Entries />
      </div>
    </div>
  );
}
