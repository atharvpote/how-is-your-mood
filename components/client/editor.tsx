"use client";

import { MutableRefObject, useEffect, useRef, useState } from "react";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { useAutosave } from "react-autosave";
import { z } from "zod";
import { deserializeDate, adjustUiForTouchDevice } from "@/utils";
import {
  Analysis as TAnalysis,
  EntryAndAnalysis,
  SetState,
} from "@/utils/types";
import { validatedData } from "@/utils/validator";
import EntryDate from "./entryDate";
import Analysis from "./analysis";
import DeleteEntry from "./deleteEntry";
import { ErrorAlert } from "./modal";

export default function Editor({
  initialEntry,
}: Readonly<{ initialEntry: EntryAndAnalysis }>) {
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

  const {
    data: autosavedAnalysis,
    mutate: mutateEntry,
    isPending: mutating,
    error: autosaveError,
    isError: isAutosaveError,
  } = useMutateEntry(useQueryClient(), cache.current);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const textarea = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    adjustUiForScroll({ textarea, setIsScrolling, setIsTouchDevice });
  }, []);

  useAutosave({
    data: content,
    onSave: (content) => {
      const trimmedContent = content.trim();

      if (previous.current !== trimmedContent) {
        previous.current = trimmedContent;

        mutateEntry({
          analysis:
            autosavedAnalysis ??
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
          <EntryDate date={date} setDate={setDate} id={initialEntry.id} />
          <DeleteEntry id={initialEntry.id} />
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
            className={`textarea size-full resize-none rounded-lg bg-neutral px-6 py-4 text-base leading-loose text-neutral-content ${!isTouchDevice && isScrolling ? "rounded-r-none" : ""}`}
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
              autosavedAnalysis ??
              updatedEntry?.analysis ??
              initialEntry.analysis
            }
            loading={mutating}
          />
        </div>
      </section>
      <ErrorAlert isError={isAutosaveError} error={autosaveError} />
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

      const entrySchema = z.object({
        date: z.string(),
        content: z.string(),
        analysis: z.object({
          sentiment: z.number(),
          mood: z.string(),
          emoji: z.string(),
          subject: z.string(),
          summery: z.string(),
        }),
      });

      const { date, content, analysis } = validatedData(entrySchema, data);

      return deserializeDate({ date, content, analysis });
    },
  });
}

function useMutateEntry(
  queryClient: QueryClient,
  cache: Map<string, TAnalysis>,
) {
  return useMutation({
    mutationFn: async ({ id, content }: EntryAndAnalysis) => {
      const cachedAnalysis = cache.get(content);

      if (cachedAnalysis) {
        await axios.put(`/api/entry/${id}/mutate`, {
          content,
          analysis: cachedAnalysis,
        });

        return cachedAnalysis;
      } else {
        const { data } = await axios.put<{ data: unknown }>(
          `/api/entry/${id}`,
          { content },
        );

        const analysisSchema = z.object({
          analysis: z.object({
            sentiment: z.number(),
            mood: z.string(),
            emoji: z.string(),
            subject: z.string(),
            summery: z.string(),
          }),
        });

        const { analysis } = validatedData(analysisSchema, data);

        return analysis;
      }
    },
    onSuccess: (data, { id, content, date }) => {
      queryClient.setQueryData(["entry", id], {
        id,
        content,
        date,
        analysis: data,
      });
    },
  });
}

function adjustUiForScroll({
  setIsScrolling,
  setIsTouchDevice: setTouchDevice,
  textarea,
}: {
  textarea: MutableRefObject<HTMLTextAreaElement | null>;
  setIsScrolling: SetState<boolean>;
  setIsTouchDevice: SetState<boolean>;
}) {
  adjustUiForTouchDevice(setTouchDevice);

  if (textarea.current)
    textarea.current.scrollHeight > textarea.current.clientHeight
      ? setIsScrolling(true)
      : setIsScrolling(false);
}
