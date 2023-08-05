import Editor from "@/components/editor";
import { getEntry } from "@/utils/server";

interface PropTypes {
  params: { id: string };
}

export default async function EntryPage({ params: { id } }: PropTypes) {
  const entry = await getEntry(id);

  if (!entry.analysis) throw new Error("Failed to fetch analysis");

  return (
    <div className="h-0 min-h-[calc(100vh-4rem)]">
      <Editor entry={entry} analysis={entry.analysis} />
    </div>
  );
}
