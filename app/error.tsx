"use client";

import { ErrorComponent } from "@/components/alerts";
import { useRouter } from "next/navigation";

interface PropType {
  error: Error & { digest?: string };
}

export default function Error({ error }: PropType) {
  const router = useRouter();

  setTimeout(() => {
    router.replace("/");
  }, 3000);

  return (
    <div className="flex h-screen items-center justify-center">
      <div>
        <ErrorComponent error={error} />
      </div>
    </div>
  );
}
