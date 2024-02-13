import { createErrorMessage } from "@/utils/error";
import { ErrorBoundaryProps } from "@/utils/types";
import { AlertError } from "./alerts";

export function DashboardError({ error }: ErrorBoundaryProps) {
  return (
    <div className="h-0 min-h-[calc(100svh-8rem)] sm:min-h-[calc(100svh-4rem)]">
      <div className="flex h-full items-center justify-center">
        <ErrorComponent error={error} />
      </div>
    </div>
  );
}

export function ErrorComponent({ error }: Readonly<{ error: Error }>) {
  return (
    <div className="p-4">
      <AlertError message={createErrorMessage(error)} />
    </div>
  );
}
