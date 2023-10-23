"use client";

import { ErrorComponent } from "@/components/alerts";
import { ErrorBoundaryProps } from "@/utils/types";

export default function EditorError({ error }: ErrorBoundaryProps) {
  return (
    <div className="flex h-[calc(100svh-var(--dashboard-nav-height))] items-center justify-center sm:h-[calc(100svh-var(--dashboard-nav-height-sm))]">
      <div>
        <ErrorComponent error={error} />
      </div>
    </div>
  );
}
