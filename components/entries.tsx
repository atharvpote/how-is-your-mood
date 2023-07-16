"use client";

import Link from "next/link";
import useSWR from "swr";
import { JournalEntry } from "@prisma/client";
import { createURL } from "@/utils/api";

export default function Entries() {
  const { data, isLoading } = useEntries();

  return isLoading ? (
    <span className="loading loading-infinity loading-lg mx-auto block"></span>
  ) : (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      <Link
        key="new"
        href="/journal/new"
        className="card bg-base-200 shadow-lg"
      >
        <div className="card-body">
          <h3 className="card-title">New Entry</h3>
        </div>
      </Link>
      {data?.map((entry) => (
        <Link
          href={`/journal/${entry.id}`}
          key={entry.id}
          className="card bg-base-200 shadow-lg"
        >
          <div className="card-body">
            <div className="card-title">
              <h3>{new Date(entry.createdAt).toDateString()}</h3>
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
