"use client";

import Link from "next/link";
import { useEntries } from "@/utils/hooks";
import { LoadingSpinner } from "./loading";
import ErrorComponent from "./error";
import { differenceInDays, format, formatRelative, subDays } from "date-fns";

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

  if (!data?.length)
    return (
      <div className="grid h-[calc(100%-4rem)] basis-full place-content-center">
        <div className="alert alert-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>Get started by creating your first entry</span>
        </div>
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {data.map((entry) => (
        <Link
          href={`/journal/${entry.id}`}
          key={entry.id}
          className="card bg-neutral text-neutral-content transition-all hover:bg-neutral-focus focus:bg-neutral-focus"
        >
          <div className="card-body">
            <div className="card-title">
              <h3 className="capitalize">
                {differenceInDays(new Date(), new Date(entry.date)) < 6
                  ? formatRelative(subDays(new Date(entry.date), 5), new Date())
                      .split("at")[0]
                      .trim()
                  : format(new Date(entry.date), "dd/MM/yyyy")}
              </h3>
            </div>
            <p className="text-neutral-content/50">
              {entry.content.substring(0, 120)}
              {entry.content.length > 120 ? "..." : ""}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
