"use client";

import { useRouter } from "next/navigation";
import { ErrorBoundaryProps } from "@/utils/types";
import { ErrorComponent } from "@/components/server/erros";

export default function ErrorBoundary({ error }: ErrorBoundaryProps) {
  const router = useRouter();

  setTimeout(() => {
    router.replace("/");
  }, 3000);

  return (
    <div className="flex h-svh items-center justify-center">
      <div>
        <ErrorComponent error={error} />
      </div>
    </div>
  );
}
