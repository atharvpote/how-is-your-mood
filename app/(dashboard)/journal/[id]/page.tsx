import Editor from "@/components/editor";
import { getEntry } from "@/utils/server";

interface PropTypes {
  params: { id: string };
}

export default async function EntryPage({ params: { id } }: PropTypes) {
  const { entry, analysis } = await getEntry(id);

  return (
    <div className="h-0 min-h-[calc(100vh-4rem)]">
      <Editor entry={entry} analysis={analysis} />
    </div>
  );
}
