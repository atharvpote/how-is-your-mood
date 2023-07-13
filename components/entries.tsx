"use client";

import { JournalEntry } from "@prisma/client";
import Link from "next/link";
import { useState, useEffect } from "react";
import EntryCard from "./entryCard";
import { createURL } from "@/utils/api";

export default function Entries() {
  const [entries, setEntries] = useState<JournalEntry[] | undefined>(undefined);

  useEffect(() => {
    void getEntries().then((entries) => {
      setEntries(entries);
    });
  }, []);

  return (
    <>
      {!entries ? (
        <div className="ml-auto mr-auto max-w-fit"> Loading...</div>
      ) : (
        <div className="grid grid-cols-3 gap-4 basis-full items-start">
          <Link
            key="new"
            href="/journal/new"
            className="overflow-hidden h-full min-h-[12rem] rounded-lg bg-white shadow"
          >
            <span className="text-3xl"> New Entry</span>
          </Link>
          {...entries.map((entry) => (
            <Link href={`/journal/${entry.id}`} key={entry.id}>
              <EntryCard entry={entry} />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

async function getEntries() {
  const response = await fetch(new Request(createURL("/api/journal/entry")), {
    method: "GET",
  });

  if (response.ok) {
    const data = (await response.json()) as { entries: JournalEntry[] };
    return data.entries;
  }
}
