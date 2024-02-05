import { LoadingSpinner } from "@/components/server/loading";

export default function EntriesLoading() {
  return (
    <div className="flex h-0 min-h-[var(--journal-page-remaining-space)] items-center justify-center sm:min-h-[var(--journal-page-remaining-space-sm-breakpoint)]">
      <LoadingSpinner />
    </div>
  );
}
