"use client";

import ErrorComponent from "@/components/error";

interface ErrorPropType {
  error: Error & { digest?: string };
}

export default function Error({ error }: ErrorPropType) {
  return (
    <div className="grid h-screen place-content-center">
      <ErrorComponent error={error} />
    </div>
  );
}
