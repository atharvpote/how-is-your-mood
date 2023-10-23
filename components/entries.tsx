"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import axios, { AxiosError } from "axios";
import { formatRelative } from "date-fns";
import { enIN } from "date-fns/locale";
import { previewLength, deserializeDate } from "@/utils";
import { ErrorComponent, GetStarted } from "./alerts";
import { handleHookError } from "@/utils/error";
import { EntryPreview, DataWithSerializedDate } from "@/utils/types";

export default function Entries({
  initialEntries,
}: {
  initialEntries: EntryPreview[];
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
    <HeightFull>
      <GetStarted />
    </HeightFull>
  ) : (
    <div className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {entries.map((entry, index) => (
        <Card key={entry.id} entry={entry} prefetch={index < 4} />
      ))}
    </div>
  );
}

function Card({
  entry: { date, id, preview },
  prefetch,
}: {
  entry: EntryPreview;
  prefetch: boolean;
}) {
  const title = formatRelative(date, new Date(), { locale: enIN })
    .split(" at ")[0]
    ?.trim();

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
          {preview.trim() + (preview.length < previewLength ? "" : "...")}
        </p>
      </article>
    </Link>
  );
}

function HeightFull({ children }: PropsWithChildren) {
  return (
    <div className="flex h-[calc(100svh-(var(--dashboard-nav-height)+var(--journal-header-height)))] items-center justify-center sm:h-[calc(100svh-(var(--dashboard-nav-height-sm)+var(--journal-header-height)))]">
      {children}
    </div>
  );
}

let firstLoad = true;

function useEntries() {
  return useSWR<EntryPreview[] | undefined, AxiosError>(
    "/api/entries",
    async (url: string) => {
      if (firstLoad) {
        firstLoad = false;

        return undefined;
      }

      try {
        const {
          data: { entries },
        } = await axios.get<{
          entries: DataWithSerializedDate<EntryPreview>[];
        }>(url);

        return entries.map(deserializeDate);
      } catch (error) {
        handleHookError(error);
      }
    },
  );
}
