"use client";

import { useEffect, useRef, useState } from "react";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { useAutosave } from "react-autosave";
import { z } from "zod";
import { isTouchDevice, deserializeDate } from "@/utils";
import { errorAlert } from "@/utils/error";
import { EntryAnalysis, EntryWithAnalysis } from "@/utils/types";
import { zodSafeParseValidator } from "@/utils/validator";
import EntryDate from "./entryDate";
import Analysis from "./analysis";
import DeleteEntry from "./deleteEntry";

export default function Editor({
  entry: {
    analysis: initialAnalysis,
    content: initialContent,
    date: initialDate,
    id,
  },
}: Readonly<{ entry: EntryWithAnalysis }>) {
  const { data: updatedEntry } = useEntry(id);

  const [content, setContent] = useState(
    updatedEntry?.content ?? initialContent,
  );

  const previous = useRef(content.trim());
  const cache = useRef(
    new Map([[content.trim(), updatedEntry?.analysis ?? initialAnalysis]]),
  );

  const [date, setDate] = useState(updatedEntry?.date ?? initialDate);

  const queryClient = useQueryClient();

  const {
    data: updatedAnalysis,
    mutate: mutateEntry,
    isPending,
  } = useMutateEntry(queryClient);
  const { mutate: mutateDate } = useMutateDate(queryClient);

  const [touchDevice, setTouchDevice] = useState(false);
  const [scroll, setScroll] = useState(false);

  const textarea = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    isTouchDevice() ? setTouchDevice(true) : setTouchDevice(false);

    if (textarea.current)
      textarea.current.scrollHeight > textarea.current.clientHeight
        ? setScroll(true)
        : setScroll(false);
  }, []);

  useAutosave({
    data: content,
    onSave: (content) => {
      const trimmedContent = content.trim();

      if (previous.current !== trimmedContent) {
        previous.current = trimmedContent;

        mutateEntry({
          analysis:
            updatedAnalysis ?? updatedEntry?.analysis ?? initialAnalysis,
          cache: cache.current,
          content,
          id,
          date,
        });
      }
    },
  });

  return (
    <div className="px-4 md:flex md:h-[calc(100svh-var(--dashboard-nav-height-sm))] lg:pl-8">
      <div className="h-[calc(100svh-11rem)] sm:h-[calc(100svh-7rem)] md:h-[calc(100%-1rem)] md:grow md:basis-full">
        <div className="flex items-center justify-between py-4">
          <EntryDate date={date} setDate={setDate} mutateDate={mutateDate} />
          <DeleteEntry />
        </div>
        <div className="h-[calc(100%-5rem)]">
          <textarea
            value={content}
            spellCheck={true}
            onChange={({ target: { value, clientHeight, scrollHeight } }) => {
              setContent(value);

              scrollHeight > clientHeight ? setScroll(true) : setScroll(false);
            }}
            className={`textarea size-full resize-none rounded-lg bg-neutral px-6 py-4 text-base leading-loose text-neutral-content ${!touchDevice && scroll ? "rounded-r-none" : undefined}`}
            ref={textarea}
          />
        </div>
      </div>
      <div className="divider md:divider-horizontal md:grow-0" />
      <section className="prose sm:mx-auto sm:max-w-2xl md:h-full md:grow-0 md:basis-96 md:self-start">
        <h2 className="font-bold md:mt-6">Analysis</h2>
        <div className="pb-4 md:relative md:h-[calc(100%-5.3rem)]">
          <Analysis
            analysis={
              updatedAnalysis ?? updatedEntry?.analysis ?? initialAnalysis
            }
            loading={isPending}
          />
        </div>
      </section>
    </div>
  );
}

let useInitialEntry = true;

function useEntry(id: string) {
  return useQuery({
    queryKey: ["entry", id],
    queryFn: async () => {
      if (useInitialEntry) {
        useInitialEntry = false;

        return null;
      }

      const { data } = await axios.get<unknown>(`/api/entry/${id}`);

      const validation = z
        .object({
          date: z.string(),
          content: z.string(),
          analysis: z.object({
            sentiment: z.number(),
            mood: z.string(),
            emoji: z.string(),
            subject: z.string(),
            summery: z.string(),
          }),
        })
        .safeParse(data);

      const { date, content, analysis } = zodSafeParseValidator(validation);

      return deserializeDate({ date, content, analysis });
    },
  });
}

function useMutateEntry(queryClient: QueryClient) {
  return useMutation({
    mutationFn: async ({
      id,
      content,
      cache,
    }: EntryWithAnalysis & {
      cache: Map<string, EntryAnalysis>;
    }) => {
      if (cache.has(content)) {
        const analysis = cache.get(content);

        await axios.put(`/api/entry/${id}/update-with-analysis`, {
          content,
          analysis: cache.get(content),
        });

        return analysis;
      } else {
        const { data } = await axios.put<{ data: unknown }>(
          `/api/entry/${id}`,
          { content },
        );

        const validation = z
          .object({
            analysis: z.object({
              sentiment: z.number(),
              mood: z.string(),
              emoji: z.string(),
              subject: z.string(),
              summery: z.string(),
            }),
          })
          .safeParse(data);

        const { analysis } = zodSafeParseValidator(validation);

        return analysis;
      }
    },
    onSuccess: (data, { id, content, date }) => {
      queryClient.setQueryData(["entry", id], (oldData?: EntryWithAnalysis) =>
        oldData
          ? { ...oldData, content, analysis: data }
          : { id, content, date, analysis: data },
      );
    },
    onError: (error) => {
      errorAlert(error);
    },
  });
}

function useMutateDate(queryClient: QueryClient) {
  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date: Date }) => {
      await axios.put(`/api/entry/${id}/update/date`, { date });

      return date;
    },
    onSuccess: async (_, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ["entry", id] });
    },
    onError: (error) => {
      errorAlert(error);
    },
  });
}
