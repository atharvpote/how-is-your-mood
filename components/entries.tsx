"use client";

import Link from "next/link";
import useSWR from "swr";
import { Analysis, JournalEntry } from "@prisma/client";
import { createURL } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiOutlinePlusSquare } from "react-icons/ai";

export default function Entries() {
  const { data, isLoading } = useEntries();
  const router = useRouter();
  const [creatingNewEntry, setCreatingNewEntry] = useState(false);

  return isLoading ? (
    <span className="loading loading-infinity loading-lg mx-auto block"></span>
  ) : (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      <button
        aria-label="new entry"
        key="new"
        onClick={() => {
          setCreatingNewEntry(true);

          void fetch(new Request(createURL("/api/journal/entry")), {
            method: "POST",
          })
            .then(async (response) => {
              if (!response.ok) {
                setCreatingNewEntry(false);

                throw new Error("Failed to create entry");
              }

              return (await response.json()) as {
                entry: JournalEntry;
                analysis: Analysis;
              };
            })
            .then((data) => {
              router.push(`/journal/${data.entry.id}`);
            });
        }}
        className="card bg-base-200 shadow-lg"
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
          className="card bg-base-200 shadow-lg"
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

function useEntries() {
  return useSWR<JournalEntry[], Error>(
    "/api/journal/entry",
    async (url: string) => {
      const response = await fetch(new Request(createURL(url)), {
        method: "GET",
      });

      if (!response.ok) throw new Error("Failed to fetch entries");

      const data = (await response.json()) as { entries: JournalEntry[] };

      return data.entries;
    },
  );
}
