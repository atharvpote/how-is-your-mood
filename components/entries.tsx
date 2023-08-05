"use client";

import Link from "next/link";
import { TopLoadingSpinner } from "./loading";
import ErrorComponent from "./error";
import { useEntries } from "@/utils/hooks";

export default function Entries() {
  const { data, error, isLoading } = useEntries();

  if (isLoading) return <TopLoadingSpinner />;
  if (error) return <ErrorComponent error={error} />;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {data?.map((entry) => (
        <Link
          href={`/journal/${entry.id}`}
          key={entry.id}
          className="card bg-base-200 shadow-md transition-all hover:bg-base-300 active:bg-neutral-focus active:text-neutral-content"
        >
          <div className="card-body">
            <div className="card-title">
              <h3 className="text-accent">
                {new Date(entry.date).toDateString()}
              </h3>
            </div>
            <p>
              {entry.content.substring(0, 120)}
              {entry.content.length > 120 ? "..." : ""}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
