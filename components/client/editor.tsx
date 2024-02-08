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
import { EntryAnalysis, EntryWithAnalysis } from "@/utils/types";
import { validatedData } from "@/utils/validator";
import EntryDate from "./entryDate";
import Analysis from "./analysis";
import DeleteEntry from "./deleteEntry";
import { ErrorAlert } from "./modal";

export default function Editor({
  initialEntry,
}: Readonly<{ initialEntry: EntryWithAnalysis }>) {
  const { data: updatedEntry } = useEntry(initialEntry.id);

  const [content, setContent] = useState(
    updatedEntry?.content ?? initialEntry.content,
  );

  const previous = useRef(content.trim());
  const cache = useRef(
    new Map([
      [content.trim(), updatedEntry?.analysis ?? initialEntry.analysis],
    ]),
  );

  const [date, setDate] = useState(updatedEntry?.date ?? initialEntry.date);

  const queryClient = useQueryClient();

  const entryMutation = useMutateEntry(queryClient, cache.current);
  const dateMutation = useMutateDate(queryClient);

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

        entryMutation.mutate({
          analysis:
            entryMutation.data ??
            updatedEntry?.analysis ??
            initialEntry.analysis,
          content,
          id: initialEntry.id,
          date,
        });
      }
    },
  });

  return (
    <div className="px-4 md:flex md:h-[calc(100svh-var(--dashboard-navbar-height-sm-breakpoint))] lg:pl-8">
      <div className="h-[calc(100svh-11rem)] sm:h-[calc(100svh-7rem)] md:h-[calc(100%-1rem)] md:grow md:basis-full">
        <div className="flex items-center justify-between py-4">
          <EntryDate
            date={date}
            setDate={setDate}
            mutateDate={dateMutation.mutate}
            id={initialEntry.id}
          />
          <DeleteEntry id={initialEntry.id} />
        </div>
        <div className="h-[calc(100%-5rem)]">
          <textarea
            value={content}
            spellCheck={true}
            onChange={({ target: { value, clientHeight, scrollHeight } }) => {
              setContent(value);

              scrollHeight > clientHeight ? setScroll(true) : setScroll(false);
            }}
            className={`textarea size-full resize-none rounded-lg bg-neutral px-6 py-4 text-base leading-loose text-neutral-content ${!touchDevice && scroll ? "rounded-r-none" : ""}`}
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
              entryMutation.data ??
              updatedEntry?.analysis ??
              initialEntry.analysis
            }
            loading={entryMutation.isPending}
          />
        </div>
      </section>
      <ErrorAlert isError={entryMutation.isError} error={entryMutation.error} />
    </div>
  );
}

let FIRST_RENDER = true;

function useEntry(id: string) {
  return useQuery({
    queryKey: ["entry", id],
    queryFn: async () => {
      if (FIRST_RENDER) {
        FIRST_RENDER = false;

        return null;
      }

      const { data } = await axios.get<unknown>(`/api/entry/${id}`);

      const { date, content, analysis } = validatedData(
        z.object({
          date: z.string(),
          content: z.string(),
          analysis: z.object({
            sentiment: z.number(),
            mood: z.string(),
            emoji: z.string(),
            subject: z.string(),
            summery: z.string(),
          }),
        }),
        data,
      );

      return deserializeDate({ date, content, analysis });
    },
  });
}

function useMutateEntry(
  queryClient: QueryClient,
  cache: Map<string, EntryAnalysis>,
) {
  return useMutation({
    mutationFn: async ({ id, content }: EntryWithAnalysis) => {
      if (cache.has(content)) {
        const analysis = cache.get(content);

        await axios.put(`/api/entry/${id}/update-with-analysis`, {
          content,
          analysis,
        });

        return analysis;
      } else {
        const { data } = await axios.put<{ data: unknown }>(
          `/api/entry/${id}`,
          { content },
        );

        const { analysis } = validatedData(
          z.object({
            analysis: z.object({
              sentiment: z.number(),
              mood: z.string(),
              emoji: z.string(),
              subject: z.string(),
              summery: z.string(),
            }),
          }),
          data,
        );

        return analysis;
      }
    },
    onSuccess: (data, { id, content, date }) => {
      queryClient.setQueryData(["entry", id], () => ({
        id,
        content,
        date,
        analysis: data,
      }));
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
  });
}
