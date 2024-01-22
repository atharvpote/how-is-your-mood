"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import axios, { AxiosError } from "axios";
import { formatRelative } from "date-fns";
import { enIN } from "date-fns/locale";
import { previewLength, deserializeDate } from "@/utils";
import { ErrorComponent, GetStarted } from "./alerts";
import { handleSWRError } from "@/utils/error";
import { EntryPreview, ReadonlyPropsWithChildren } from "@/utils/types";
import { z } from "zod";
import { zodSafeParseValidator } from "@/utils/validator";

export default function Entries({
  initialEntries,
}: Readonly<{
  initialEntries: EntryPreview[];
}>) {
  const [entries, setEntries] = useState(initialEntries);

  const { data: updatedEntries, error } = useEntries();

  useEffect(() => {
    if (updatedEntries) {
      setEntries(updatedEntries);
    }
  }, [updatedEntries]);

  if (error) {
    return (
      <HeightFull>
        <div>
          <ErrorComponent error={error} />
        </div>
      </HeightFull>
    );
  }

  if (!entries.length) {
    return (
      <HeightFull>
        <GetStarted />
      </HeightFull>
    );
  }

  return (
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
}: Readonly<{
  entry: EntryPreview;
  prefetch: boolean;
}>) {
  const title = formatRelative(date, new Date(), { locale: enIN })
    .split(" at ")[0]
    ?.trim();

  return (
    <Link
      key={id}
      href={`/journal/${id}`}
      prefetch={prefetch}
      className="card bg-neutral text-neutral-content transition-all hover:bg-neutral-800"
    >
      <article className="prose card-body">
        <div className="card-title">
          <h3 className="capitalize text-neutral-content">{title}</h3>
        </div>
        <p className="overflow-hidden text-neutral-content/75">
          {preview.trim() + ellipsis(preview, previewLength)}
        </p>
      </article>
    </Link>
  );
}

function ellipsis(str: string, length: number) {
  if (str.length > length) return "...";
}

function HeightFull({ children }: ReadonlyPropsWithChildren) {
  return (
    <div className="flex h-[var(--journal-page-remaining-space)] items-center justify-center sm:h-[--journal-page-remaining-space-sm]">
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
        const { data } = await axios.get<unknown>(url);

        const validation = z
          .object({
            entries: z
              .object({
                id: z.string(),
                preview: z.string(),
                date: z.string(),
              })
              .array(),
          })
          .safeParse(data);

        const { entries } = zodSafeParseValidator(validation);

        return entries.map(deserializeDate);
      } catch (error) {
        handleSWRError(error);
      }
    },
  );
}
