"use client";

import { ErrorComponent } from "@/components/alerts";
import { ErrorBoundaryProps } from "@/utils";

export default function UserError({ error }: ErrorBoundaryProps) {
  return <ErrorComponent error={error} />;
}
