"use client";

import { ErrorComponent } from "@/components/server/alerts";
import { ErrorBoundaryProps } from "@/utils/types";

export default function EntriesError({ error }: ErrorBoundaryProps) {
  return (
    <div className="flex h-[var(--journal-page-remaining-space)] items-center justify-center sm:h-[var(--journal-page-remaining-space-sm-breakpoint)]">
      <ErrorComponent error={error} />
    </div>
  );
}
