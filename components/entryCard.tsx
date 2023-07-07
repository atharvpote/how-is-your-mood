import { JournalEntry } from "@prisma/client";

export default function EntryCard({ entry }: { entry: JournalEntry }) {
  const date = new Date(entry.createdAt).toDateString();

  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
      <div className="px-4 py-5">{date}</div>
      <div className="px-4 py-5">summery</div>
      <div className="px-4 py-4">mood</div>
    </div>
  );
}
