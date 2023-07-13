import Editor from "@/components/editor";

interface PropTypes {
  params: { id: string };
}

export default function EntryPage({ params: { id } }: PropTypes) {
  return <Editor id={id} />;
}
