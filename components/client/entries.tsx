"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRelative } from "date-fns";
import { enIN } from "date-fns/locale";
import { PREVIEW_LENGTH } from "@/utils";
import { GetStarted } from "../server/alerts";
import { Preview } from "@/utils/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { JournalFullHeight } from "../server/layouts";
import { ErrorComponent } from "../server/erros";
import { getEntries } from "@/utils/actions";

export default function Entries({
  entries,
}: Readonly<{
  entries: Preview[];
}>) {
  const [entryList, setEntryList] = useState(entries);

  const update = useEntries();
  const queryClient = useQueryClient();
  if (!update.data) queryClient.setQueryData(["entries"], entries);
  useEffect(() => {
    if (update.data) setEntryList(update.data);
  }, [update.data]);

  if (update.error)
    return (
      <JournalFullHeight>
        <div>
          <ErrorComponent error={update.error} />
        </div>
      </JournalFullHeight>
    );

  if (!entryList.length)
    return (
      <JournalFullHeight>
        <GetStarted />
      </JournalFullHeight>
    );

  return (
    <div className="grid grid-cols-1 gap-8 py-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {entryList.map(({ id, date, preview }, index) => (
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
              {`${preview.trim()}${ellipsis(preview)}`}
            </p>
          </article>
        </Link>
      ))}
    </div>
  );
}

function useEntries() {
  return useQuery({
    queryKey: ["entries"],
    queryFn: async () => await getEntries(),
  });
}

function ellipsis(str: string) {
  return str.length >= PREVIEW_LENGTH ? "..." : "";
}
