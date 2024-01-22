"use client";

import { useContext, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import axios, { AxiosError } from "axios";
import { useAutosave } from "react-autosave";
import { AnalysisContext } from "@/contexts/analysis";
import { isTouchDevice, deserializeDate } from "@/utils";
import { EntryDateContext } from "@/contexts/entryDate";
import { useParams } from "next/navigation";
import { errorAlert, handleSWRError } from "@/utils/error";
import {
  AnalysisContextInterface,
  Entry,
  EntryAnalysis,
  EntryDateContextInterface,
} from "@/utils/types";
import { notNullValidator, zodSafeParseValidator } from "@/utils/validator";
import { z } from "zod";

export default function Editor({
  entry,
}: Readonly<{ entry: Omit<Entry, "id"> }>) {
  const { id } = useParams();

  if (!id || Array.isArray(id)) {
    throw new Error("Entry ID is undefined");
  }

  const analysisContext = useContext(AnalysisContext);
  const entryDateContext = useContext(EntryDateContext);

  notNullValidator<AnalysisContextInterface>(
    analysisContext,
    "AnalysisContext must be used within AnalysisContextProvider",
  );

  notNullValidator<EntryDateContextInterface>(
    entryDateContext,
    "EntryDateContext must be used within EntryDateContextProvider",
  );

  const {
    cache: { current: cache },
    setAnalysis,
    setLoading,
  } = analysisContext;

  const { setDate } = entryDateContext;

  const [content, setContent] = useState(entry.content);
  const [touchDevice, setTouchDevice] = useState(false);
  const [scroll, setScroll] = useState(false);

  const textarea = useRef<HTMLTextAreaElement | null>(null);
  const previous = useRef(content.trim());

  const { data: updatedEntry } = useEntry(id);

  useEffect(() => {
    if (updatedEntry) {
      setAnalysis(updatedEntry.analysis);
      setContent(updatedEntry.content);
      setDate(updatedEntry.date);
    }
  }, [setAnalysis, setDate, updatedEntry]);

  useEffect(() => {
    if (isTouchDevice()) {
      setTouchDevice(true);
    } else {
      setTouchDevice(false);
    }

    if (textarea.current) {
      if (textarea.current.scrollHeight > textarea.current.clientHeight) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    }
  }, []);

  useAutosave({
    data: content,
    onSave: (content) => {
      const trimmedContent = content.trim();

      if (previous.current !== trimmedContent) {
        previous.current = trimmedContent;

        const match = cache.get(trimmedContent);

        if (match) {
          setAnalysis(match);

          if (previous.current !== trimmedContent) {
            axios
              .put(`/api/entry/${id}/update-with-analysis`, {
                content,
                analysis: match,
              })
              .catch((error) => {
                errorAlert(error);
              });
          }
        } else {
          setLoading(true);

          axios
            .put<{ data: unknown }>(`/api/entry/${id}`, {
              content,
            })
            .then(({ data }) => {
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
            })
            .then((analysis) => {
              setAnalysis(analysis);

              cache.set(trimmedContent, analysis);
            })
            .catch((error) => {
              errorAlert(error);
            })
            .finally(() => {
              setLoading(false);
            });
        }
      }
    },
  });

  return (
    <textarea
      value={content}
      spellCheck={true}
      onChange={({ target: { value, clientHeight, scrollHeight } }) => {
        setContent(value);

        if (scrollHeight > clientHeight) {
          setScroll(true);
        } else {
          setScroll(false);
        }
      }}
      className={`textarea size-full resize-none rounded-lg bg-neutral px-6 py-4 text-base leading-loose text-neutral-content ${!touchDevice && scroll ? "rounded-r-none" : undefined}`}
      ref={textarea}
    />
  );
}

interface UpdatedEntry {
  date: Date;
  content: string;
  analysis: EntryAnalysis;
}

let firstLoad = true;

function useEntry(id: string) {
  return useSWR<UpdatedEntry | undefined, AxiosError>(
    `/api/entry/${id}`,
    async (url: string) => {
      if (firstLoad) {
        firstLoad = false;

        return undefined;
      }

      try {
        const { data } = await axios.get<unknown>(url);

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
      } catch (error) {
        handleSWRError(error);
      }
    },
  );
}
