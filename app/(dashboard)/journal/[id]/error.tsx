"use client";

import { ErrorComponent } from "@/components/alerts";
import { ErrorBoundaryProps } from "@/utils";

export default function EditorError({ error }: ErrorBoundaryProps) {
  return (
    <div className="flex h-[calc(100vh-var(--dashboard-nav-height))] items-center justify-center sm:h-[calc(100vh-var(--dashboard-nav-height-sm))]">
      <div>
        <ErrorComponent error={error} />
      </div>
    </div>
  );
}
