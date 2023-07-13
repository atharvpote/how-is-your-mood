import Question from "@/components/question";
import Entries from "@/components/entries";

export default function Journal() {
  return (
    <div className="p-10 bg-zinc-400/10 min-h-[calc(100vh-3.5rem)]">
      <h2 className="text-3xl mb-8">Journal</h2>
      <Question />
      <Entries />
    </div>
  );
}
