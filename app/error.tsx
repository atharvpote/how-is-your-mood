"use client";

import { useRouter } from "next/navigation";
import { ErrorComponent } from "@/components/server/alerts";
import { ErrorBoundaryProps } from "@/utils/types";

export default function ErrorBoundary({ error }: ErrorBoundaryProps) {
  const router = useRouter();

  setTimeout(() => {
    router.replace("/");
  }, 3000);

  return (
    <div className="flex h-[100svh] items-center justify-center">
      <div>
        <ErrorComponent error={error} />
      </div>
    </div>
  );
}
