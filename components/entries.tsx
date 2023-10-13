"use client";

import { PropsWithChildren } from "react";
import Link from "next/link";
import useSWR from "swr";
import axios, { AxiosError } from "axios";
import { differenceInDays, format, formatRelative } from "date-fns";
import { Journal } from "@prisma/client";
import GetStarted from "./getStarted";
import ErrorComponent from "./error";

export default function Entries({ entries }: { entries: Entry[] }) {
  const { data, error } = useEntries();

  if (data === undefined)
    if (entries.length === 0) return <GetStartedFullScreen />;
    else return <MapEntries entries={entries} />;

  if (error)
    return (
      <FullScreen>
        <ErrorComponent error={error} />
      </FullScreen>
    );

  if (data.length === 0) return <GetStartedFullScreen />;

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
      <article className="prose card-body">
        <div className="card-title">
          <h3 className="capitalize text-neutral-content">{title}</h3>
        </div>
        <p className="overflow-hidden text-neutral-content/50">
          {entry.content.substring(0, 120).trim()}
          {entry.content.length > 120 ? "..." : ""}
        </p>
      </article>
    </Link>
  );
}

function FullScreen({ children }: PropsWithChildren) {
  return (
    <div className="flex h-[calc(100vh-11rem)] items-center justify-center">
      {children}
    </div>
  );
}

function GetStartedFullScreen() {
  return (
    <FullScreen>
      <GetStarted />
    </FullScreen>
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
