"use client";

import { ErrorComponent } from "@/components/alerts";
import { ErrorBoundaryProps } from "@/utils/types";

export default function UserError({ error }: ErrorBoundaryProps) {
  return <ErrorComponent error={error} />;
}
