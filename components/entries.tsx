"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import axios, { AxiosError } from "axios";
import { differenceInDays, format, formatRelative } from "date-fns";
import { Entry } from "@/utils";
import { ErrorComponent, GetStarted } from "./alerts";

export default function Entries({
  initialEntries,
}: {
  initialEntries: Entry[];
}) {
  const [entries, setEntries] = useState(initialEntries);

  const { data: updatedEntries, error } = useEntries();

  useEffect(() => {
    if (updatedEntries) setEntries(updatedEntries);
  }, [updatedEntries]);

  if (error)
    return (
      <HeightFull>
        <div>
          <ErrorComponent error={error} />
        </div>
      </HeightFull>
    );

  return !entries.length ? (
    <GetStartedHeightFull />
  ) : (
    <div className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {entries.map((entry, index) => (
        <Card key={entry.id} entry={entry} prefetch={index < 4} />
      ))}
    </div>
  );
}

const previewLength = 100;

function Card({
  entry: { content, date, id },
  prefetch,
}: {
  entry: Entry;
  prefetch: boolean;
}) {
  const today = new Date();

  const title =
    differenceInDays(today, date) < 7
      ? formatRelative(date, today).split(" at ")[0]?.trim()
      : format(date, "dd/MM/yyyy");

  return (
    <Link
      key={id}
      href={`/journal/${id}`}
      prefetch={prefetch}
      className="card bg-neutral text-neutral-content transition-all hover:bg-neutral-focus focus:bg-neutral-focus"
    >
      <article className="prose card-body">
        <div className="card-title">
          <h3 className="capitalize text-neutral-content">{title}</h3>
        </div>
        <p className="overflow-hidden text-neutral-content/75">
          {content.substring(0, previewLength).trim()}
          {content.length > previewLength ? "..." : ""}
        </p>
      </article>
    </Link>
  );
}

function useEntries() {
  return useSWR<Entry[], AxiosError>("/api/entries", async (url: string) => {
    const {
      data: { entries },
    } = await axios.get<{ entries: Entry[] }>(url);

    return entries.map((entry) => ({ ...entry, date: new Date(entry.date) }));
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
    <div className="flex h-[calc(100svh-(var(--dashboard-nav-height)+var(--journal-header-height)))] items-center justify-center sm:h-[calc(100svh-(var(--dashboard-nav-height-sm)+var(--journal-header-height)))]">
      {children}
    </div>
  );
}
