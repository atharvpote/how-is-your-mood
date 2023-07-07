"use client";

import { useRouter } from "next/navigation";
import { createNewEntry } from "@/utils/api";

export default function NewEntryCard() {
  const router = useRouter();
  return (
    <div className="cursor-pointer overflow-hidden rounded-lg bg-white shadow">
      <div
        className="px-4 py-5 sm:p-6"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={async () => {
          const entry = await createNewEntry();

          if (entry) router.push(`/journal/${entry.id}`);
        }}
      >
        <span className="text-3xl">New Entry</span>
      </div>
    </div>
  );
}
