"use client";

import { PropsWithChildren } from "react";
import Link from "next/link";
import useSWR from "swr";
import axios, { AxiosError } from "axios";
import { differenceInDays, format, formatRelative } from "date-fns";
import { Journal } from "@prisma/client";
import { ErrorComponent, GetStarted } from "./alerts";

export default function Entries({ entries }: { entries: Entry[] }) {
  const { data: upstreamEntries, error } = useEntries();

  if (upstreamEntries === undefined)
    if (entries.length === 0) return <GetStartedHeightFull />;
    else return <MapEntries entries={entries} />;

  if (error)
    return (
      <HeightFull>
        <div>
          <ErrorComponent error={error} />
        </div>
      </HeightFull>
    );

  if (upstreamEntries.length === 0) return <GetStartedHeightFull />;

  return <MapEntries entries={upstreamEntries} />;
}

function MapEntries({ entries }: { entries: Entry[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {entries.map((entry, index) => (
        <Card key={entry.id} entry={entry} prefetch={index < 4} />
      ))}
    </div>
  );
}

const previewLength = 100;

function Card({ entry, prefetch }: { entry: Entry; prefetch: boolean }) {
  const today = new Date();
  const entryDate = new Date(entry.date);

  const title =
    differenceInDays(today, entryDate) < 7
      ? formatRelative(entryDate, today).split(" at ")[0].trim()
      : format(entryDate, "dd/MM/yyyy");

  return (
    <Link
      key={entry.id}
      href={`/journal/${entry.id}`}
      prefetch={prefetch}
      className="card bg-neutral text-neutral-content transition-all hover:bg-neutral-focus focus:bg-neutral-focus"
    >
      <article className="prose card-body">
        <div className="card-title">
          <h3 className="capitalize text-neutral-content">{title}</h3>
        </div>
        <p className="overflow-hidden text-neutral-content/75">
          {entry.content.substring(0, previewLength).trim()}
          {entry.content.length > previewLength ? "..." : ""}
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

function GetStartedHeightFull() {
  return (
    <HeightFull>
      <div>
        <GetStarted />
      </div>
    </HeightFull>
  );
}

function HeightFull({ children }: PropsWithChildren) {
  return (
    <div className="flex h-[calc(100vh-(var(--dashboard-nav-height)+var(--journal-header-height)))] items-center justify-center sm:h-[calc(100vh-(var(--dashboard-nav-height-sm)+var(--journal-header-height)))]">
      {children}
    </div>
  );
}
