"use client";

import { ErrorComponent } from "@/components/alerts";

interface PropType {
  error: Error & { digest?: string };
}

export default function Error({ error }: PropType) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div>
        <ErrorComponent error={error} />
      </div>
    </div>
  );
}
