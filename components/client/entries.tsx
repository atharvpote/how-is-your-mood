"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { formatRelative } from "date-fns";
import { enIN } from "date-fns/locale";
import { PREVIEW_LENGTH, deserializeDate } from "@/utils";
import { ErrorComponent, GetStarted } from "../server/alerts";
import { EntryPreview } from "@/utils/types";
import { z } from "zod";
import { validatedData } from "@/utils/validator";
import { useQuery } from "@tanstack/react-query";
import { JournalFullHeight } from "../server/layouts";

export default function Entries({
  initialEntries,
}: Readonly<{
  initialEntries: EntryPreview[];
}>) {
  const [entries, setEntries] = useState(initialEntries);

  const { data: updatedEntries, error: updatedEntriesError } = useEntries();

  useEffect(() => {
    if (updatedEntries) setEntries(updatedEntries);
  }, [updatedEntries]);

  if (updatedEntriesError)
    return (
      <JournalFullHeight>
        <div>
          <ErrorComponent error={updatedEntriesError} />
        </div>
      </JournalFullHeight>
    );

  if (!entries.length)
    return (
      <JournalFullHeight>
        <GetStarted />
      </JournalFullHeight>
    );

  return (
    <div className="grid grid-cols-1 gap-8 py-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {entries.map(({ id, date, preview }, index) => (
        <Link
          key={id}
          href={`/journal/${id}`}
          prefetch={index < 4}
          className="card bg-neutral text-neutral-content transition-all hover:scale-105 hover:bg-neutral-800 active:scale-95"
        >
          <article className="prose card-body">
            <div className="card-title">
              <h3 className="capitalize text-neutral-content">
                {formatRelative(date, new Date(), { locale: enIN })
                  .split(" at ")[0]
                  ?.trim()}
              </h3>
            </div>
            <p className="overflow-hidden text-neutral-content/75">
              {`${preview.trim()}${preview.length >= PREVIEW_LENGTH ? "..." : ""}`}
            </p>
          </article>
        </Link>
      ))}
    </div>
  );
}

let FIRST_RENDER = true;

function useEntries() {
  return useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      if (FIRST_RENDER) {
        FIRST_RENDER = false;

        return null;
      }

      const { data } = await axios.get<unknown>("/api/entries");

      const { entries } = validatedData(
        z.object({
          entries: z
            .object({
              id: z.string(),
              preview: z.string(),
              date: z.string(),
            })
            .array(),
        }),
        data,
      );

      return entries.map(deserializeDate);
    },
  });
}
