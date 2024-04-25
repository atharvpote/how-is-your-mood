"use client";

import { useEffect, useRef, useState } from "react";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAutosave } from "react-autosave";
import { isTouchDevice } from "@/utils";
import { Analysis as AnalysisType, Entry } from "@/utils/types";
import { getEntry, updateEntry } from "@/utils/actions";
import EntryDate from "./entryDate";
import Analysis from "./analysis";
import DeleteEntry from "./deleteEntry";
import { ErrorAlert } from "./modal";

export default function Editor({ entry }: Readonly<{ entry: Entry }>) {
  const [content, setContent] = useState(entry.content);
  const [date, setDate] = useState(new Date(entry.date));
  const [analysis, setAnalysis] = useState<AnalysisType>({
    emoji: entry.emoji,
    mood: entry.mood,
    sentiment: entry.sentiment,
    subject: entry.subject,
    summery: entry.summery,
  });
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const previousContentRef = useRef(content.trim());
  const cacheRef = useRef(new Map([[content.trim(), analysis]]));

  const queryResult = useEntry(entry.id);

  const queryClient = useQueryClient();
  if (!queryResult.data) queryClient.setQueryData(["entry", entry.id], entry);

  useEffect(
    function updateStateOnLoad() {
      if (queryResult.data) {
        setContent(queryResult.data.content);
        setDate(new Date(queryResult.data.date));
      }

      if (queryResult.isError) {
        setIsError(true);
        setError(queryResult.error);
      }
    },
    [queryResult.data, queryResult.error, queryResult.isError],
  );

  const mutationResult = useMutateEntry(queryClient, cacheRef.current);

  useEffect(
    function updateStateOnMutation() {
      if (mutationResult.data?.analysis)
        setAnalysis(mutationResult.data.analysis);

      if (mutationResult.isError) {
        setIsError(true);
        setError(mutationResult.error);
      }
    },
    [mutationResult.data, mutationResult.error, mutationResult.isError],
  );

  useAutosave({
    data: content,
    onSave: (content) => {
      const trimmedContent = content.trim();

      if (previousContentRef.current !== trimmedContent) {
        mutationResult.mutate({
          content,
          id: entry.id,
          date: date.getTime(),
        });

        previousContentRef.current = trimmedContent;
      }
    },
  });

  const textarea = useRef<HTMLTextAreaElement | null>(null);

  useEffect(function adjustUi() {
    if (textarea.current)
      textarea.current.scrollHeight > textarea.current.clientHeight
        ? setIsScrolling(true)
        : setIsScrolling(false);
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
          <Analysis analysis={analysis} loading={mutationResult.isPending} />
        </div>
      </section>
      <ErrorAlert isError={isError} error={error} />
    </div>
  );
}

function useEntry(id: string) {
  return useQuery({
    queryKey: ["entry", id],
    queryFn: async () => await getEntry(id),
  });
}

function useMutateEntry(
  queryClient: QueryClient,
  cache: Map<string, AnalysisType>,
) {
  return useMutation({
    mutationFn: async ({
      id,
      content,
    }: Pick<Entry, "id" | "content" | "date">) => {
      const cachedAnalysis = cache.get(content);

      if (cachedAnalysis) {
        await updateEntry(id, content, cachedAnalysis);

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
