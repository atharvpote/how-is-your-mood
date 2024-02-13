"use client";

import { MutableRefObject, useEffect, useRef, useState } from "react";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAutosave } from "react-autosave";
import { isTouchDevice } from "@/utils";
import { Analysis as TypeAnalysis, Entry, SetState } from "@/utils/types";
import { getEntry, mutateEntry, updateEntry } from "@/utils/actions";
import EntryDate from "./entryDate";
import Analysis from "./analysis";
import DeleteEntry from "./deleteEntry";
import { ErrorAlert } from "./modal";

export default function Editor({ entry }: Readonly<{ entry: Entry }>) {
  const [content, setContent] = useState(entry.content);
  const [date, setDate] = useState(entry.date);
  const [analysis, setAnalysis] = useState(entry.analysis);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const previousContent = useRef(content.trim());
  const cache = useRef(new Map([[content.trim(), entry.analysis]]));

  const update = useEntry(entry.id);
  const queryClient = useQueryClient();
  if (!update.data) queryClient.setQueryData(["entry", entry.id], entry);
  useEffect(() => {
    if (update.data) {
      setContent(update.data.content);
      setDate(update.data.date);
    }

    if (update.isError) {
      setIsError(true);
      setError(update.error);
    }
  }, [update.data, update.error, update.isError]);

  const mutation = useMutateEntry(queryClient, cache.current);
  useEffect(() => {
    if (mutation.data) setAnalysis(mutation.data.analysis);

    if (mutation.isError) {
      setIsError(true);
      setError(mutation.error);
    }
  }, [mutation.data, mutation.error, mutation.isError]);

  useAutosave({
    data: content,
    onSave: (content) => {
      const trimmedContent = content.trim();

      if (previousContent.current !== trimmedContent) {
        previousContent.current = trimmedContent;

        mutation.mutate({
          analysis,
          content,
          id: entry.id,
          date,
        });
      }
    },
  });

  const textarea = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    adjustUi(textarea, setIsScrolling);
  }, []);

  return (
    <div className="px-4 md:flex md:h-[calc(100svh-var(--dashboard-navbar-height-sm-breakpoint))] lg:pl-8">
      <div className="h-[calc(100svh-11rem)] sm:h-[calc(100svh-7rem)] md:h-[calc(100%-1rem)] md:grow md:basis-full">
        <div className="flex items-center justify-between py-4">
          <EntryDate date={date} setDate={setDate} id={entry.id} />
          <DeleteEntry id={entry.id} />
        </div>
        <div className="h-[calc(100%-5rem)]">
          <textarea
            value={content}
            spellCheck={true}
            onChange={({ target: { value, clientHeight, scrollHeight } }) => {
              setContent(value);

              scrollHeight > clientHeight
                ? setIsScrolling(true)
                : setIsScrolling(false);
            }}
            className={`textarea size-full resize-none rounded-lg bg-neutral px-6 py-4 text-base leading-loose text-neutral-content ${!isTouchDevice() && isScrolling ? "rounded-r-none" : ""}`}
            ref={textarea}
          />
        </div>
      </div>
      <div className="divider md:divider-horizontal md:grow-0" />
      <section className="prose sm:mx-auto sm:max-w-2xl md:h-full md:grow-0 md:basis-96 md:self-start">
        <h2 className="font-bold md:mt-6">Analysis</h2>
        <div className="pb-4 md:relative md:h-[calc(100%-5.3rem)]">
          <Analysis analysis={analysis} loading={mutation.isPending} />
        </div>
      </section>
      <ErrorAlert isError={isError} error={error} />
    </div>
  );
}

function useEntry(id: string) {
  return useQuery({
    queryKey: ["entry", id],
    queryFn: async () => {
      const { date, content, analysis } = await getEntry(id);

      return { date, content, analysis };
    },
  });
}

function useMutateEntry(
  queryClient: QueryClient,
  cache: Map<string, TypeAnalysis>,
) {
  return useMutation({
    mutationFn: async ({ id, content }: Entry) => {
      const cachedAnalysis = cache.get(content);

      if (cachedAnalysis) {
        await mutateEntry(id, content, cachedAnalysis);

        return { analysis: cachedAnalysis };
      }

      const analysis = await updateEntry(id, content);

      return { analysis };
    },
    onSuccess: ({ analysis }, { id, content, date }) => {
      queryClient.setQueryData(["entry", id], {
        id,
        content,
        date,
        analysis,
      });
    },
  });
}

function adjustUi(
  textarea: MutableRefObject<HTMLTextAreaElement | null>,
  setIsScrolling: SetState<boolean>,
) {
  if (textarea.current)
    textarea.current.scrollHeight > textarea.current.clientHeight
      ? setIsScrolling(true)
      : setIsScrolling(false);
}
