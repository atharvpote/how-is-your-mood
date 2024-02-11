"use client";

import { ErrorComponent } from "@/components/server/erros";
import { ErrorBoundaryProps } from "@/utils/types";

export default function EditorError({ error }: ErrorBoundaryProps) {
  return (
    <div className="flex h-[calc(100svh-var(--dashboard-navbar-height))] items-center justify-center sm:h-[calc(100svh-var(--dashboard-navbar-height-sm-breakpoint))]">
      <div>
        <ErrorComponent error={error} />
      </div>
    </div>
  );
}
