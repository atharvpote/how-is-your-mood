"use client";

import { DashboardError } from "@/components/server/erros";
import { ErrorBoundaryProps } from "@/utils/types";

export default function ErrorPage({ error }: ErrorBoundaryProps) {
  return <DashboardError error={error} />;
}
