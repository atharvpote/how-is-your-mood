"use client";

import Link from "next/link";
import { createEntry, useEntries } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiOutlinePlusSquare } from "react-icons/ai";
import { TopLoadingSpinner } from "./loading";

export default function Entries() {
  const { data, isLoading } = useEntries();
  const router = useRouter();
  const [creatingNewEntry, setCreatingNewEntry] = useState(false);

  return isLoading ? (
    <TopLoadingSpinner />
  ) : (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      <button
        aria-label="new entry"
        key="new"
        onClick={() => {
          setCreatingNewEntry(true);

          void createEntry()
            .then((id) => router.push(`/journal/${id}`))
            .catch((error) => {
              if (error instanceof Error) console.error(error.message);
            })
            .finally(() => setCreatingNewEntry(false));
        }}
        className="card bg-base-200 shadow-lg active:bg-base-300"
      >
        <div className="grid h-full w-full place-content-center">
          {creatingNewEntry ? (
            <span className="loading loading-infinity loading-lg"></span>
          ) : (
            <div className="card-body">
              <AiOutlinePlusSquare className="text-3xl md:text-4xl" />
            </div>
          )}
        </div>
      </button>
      {data?.map((entry) => (
        <Link
          href={`/journal/${entry.id}`}
          key={entry.id}
          className="card bg-base-200 shadow-lg active:bg-base-300"
        >
          <div className="card-body">
            <div className="card-title">
              <h3>{new Date(entry.entryDate).toDateString()}</h3>
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