"use client";

import { ErrorComponent } from "@/components/server/erros";
import { ErrorBoundaryProps } from "@/utils/types";

export default function UserError({ error }: ErrorBoundaryProps) {
  return <ErrorComponent error={error} />;
}
