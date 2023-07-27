"use client";

import Link from "next/link";
import { createEntry, errorAlert, useEntries } from "@/utils/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiOutlinePlusSquare } from "react-icons/ai";
import { TopLoadingSpinner } from "./loading";
import ErrorComponent from "./error";

export default function Entries() {
  const { data, error, isLoading } = useEntries();
  const router = useRouter();
  const [creatingNewEntry, setCreatingNewEntry] = useState(false);

  if (isLoading) return <TopLoadingSpinner />;
  if (error) return <ErrorComponent error={error} />;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-medium text-accent">Journal</h2>
        <div className="tooltip tooltip-left" data-tip="New">
          <button
            aria-label="new entry"
            key="new"
            onClick={() => {
              setCreatingNewEntry(true);

              void createEntry()
                .then((id) => router.push(`/journal/${id}`))
                .catch((error) => errorAlert(error))
                .finally(() => setCreatingNewEntry(false));
            }}
            className="btn btn-square"
          >
            {creatingNewEntry ? (
              <span className="loading loading-infinity"></span>
            ) : (
              <div className="">
                <AiOutlinePlusSquare className="text-3xl" />
              </div>
            )}
          </button>
        </div>
      </div>
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
                  {new Date(entry.entryDate).toDateString()}
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
    </div>
  );
}
