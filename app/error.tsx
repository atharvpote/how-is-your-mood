"use client";

import ErrorComponent from "@/components/error";

interface PropType {
  error: Error & { digest?: string };
}

export default function Error({ error }: PropType) {
  return (
    <div className="grid h-screen place-content-center">
      <ErrorComponent error={error} />
    </div>
  );
}
