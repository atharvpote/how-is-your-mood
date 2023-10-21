"use client";

import { ErrorComponent } from "@/components/alerts";
import { ErrorBoundaryProps } from "@/utils";

export default function EntriesError({ error }: ErrorBoundaryProps) {
  return (
    <div className="flex h-[calc(100svh-(var(--dashboard-nav-height)+var(--journal-header-height)))] items-center justify-center sm:h-[calc(100svh-(var(--dashboard-nav-height-sm)+var(--journal-header-height)))]">
      <ErrorComponent error={error} />
    </div>
  );
}
