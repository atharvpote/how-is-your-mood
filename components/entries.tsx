"use client";

import Link from "next/link";
import ErrorComponent from "./error";
import { differenceInDays, format, formatRelative } from "date-fns";
import useSWR from "swr";
import axios, { AxiosError } from "axios";
import { Journal } from "@prisma/client";
import GetStarted from "./getStarted";
export default function Entries({ entries }: { entries: Entry[] }) {
  const { data, error } = useEntries();

  if (data === undefined)
    if (entries.length === 0) return <GetStarted />;
    else return <MapEntries entries={entries} />;

  if (error)
    return (
      <div className="grid h-[calc(100%-4rem)] place-content-center">
        <ErrorComponent error={error} />
      </div>
    );

  if (data.length === 0) return <GetStarted />;

  return <MapEntries entries={data} />;
}

function MapEntries({ entries }: { entries: Entry[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {entries.map((entry) => (
        <Card key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

function Card({ entry }: { entry: Entry }) {
  const today = new Date();
  const entryDate = new Date(entry.date);

  const title =
    differenceInDays(today, entryDate) < 7
      ? formatRelative(entryDate, today).split(" at ")[0].trim()
      : format(entryDate, "dd/MM/yyyy");

  return (
    <Link
      href={`/journal/${entry.id}`}
      key={entry.id}
      className="card bg-neutral text-neutral-content transition-all hover:bg-neutral-focus focus:bg-neutral-focus"
    >
      <article className="card-body">
        <div className="card-title">
          <h3 className="capitalize">{title}</h3>
        </div>
        <p className="text-neutral-content/50">
          {entry.content.substring(0, 120).trim()}
          {entry.content.length > 120 ? "..." : ""}
        </p>
      </article>
    </Link>
  );
}

export type Entry = Pick<Journal, "id" | "date" | "content">;

function useEntries() {
  return useSWR<Entry[], AxiosError>("/api/journal", async (url: string) => {
    const {
      data: { entries },
    } = await axios.get<{ entries: Entry[] }>(url);

    return entries;
  });
}
