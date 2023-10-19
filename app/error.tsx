"use client";

import { ErrorComponent } from "@/components/alerts";
import { ErrorBoundaryProps } from "@/utils";
import { useRouter } from "next/navigation";

export default function Error({ error }: ErrorBoundaryProps) {
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
