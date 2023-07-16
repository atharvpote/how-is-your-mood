"use client";

import { useEffect } from "react";

interface ErrorPropType {
  error: Error & { digest?: string };
}

export default function Error({ error }: ErrorPropType) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
    </div>
  );
}
