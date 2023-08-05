"use client";

import Link from "next/link";
import { useEntries } from "@/utils/hooks";
import { LoadingSpinner } from "./loading";
import ErrorComponent from "./error";

export default function Entries() {
  const { data, error, isLoading } = useEntries();

  if (isLoading)
    return (
      <div className="grid h-[calc(100%-4rem)] place-content-center">
        <LoadingSpinner />
      </div>
    );

  if (error)
    return (
      <div className="grid h-[calc(100%-4rem)] place-content-center">
        <ErrorComponent error={error} />
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {data?.map((entry) => (
        <Link
          href={`/journal/${entry.id}`}
          key={entry.id}
          className="card bg-base-200 transition-all hover:bg-base-300 active:bg-neutral-focus active:text-neutral-content"
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
