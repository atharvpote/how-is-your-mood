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
  DataWithSerializedDate,
  Entry,
  EntryAnalysis,
  EntryDateContextInterface,
} from "@/utils/types";
import { notNullValidator } from "@/utils/validator";

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
    isTouchDevice() ? setTouchDevice(true) : setTouchDevice(false);

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
            .put<{ analysis: EntryAnalysis }>(`/api/entry/${id}`, {
              content,
            })
            .then(({ data: { analysis } }) => {
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

        scrollHeight > clientHeight ? setScroll(true) : setScroll(false);
      }}
      className={`textarea size-full resize-none rounded-lg bg-neutral px-6 py-4 text-base leading-loose text-neutral-content${
        !touchDevice && scroll ? "rounded-r-none" : ""
      }`}
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
        const {
          data: { date, content, analysis },
        } = await axios.get<DataWithSerializedDate<UpdatedEntry>>(url);

        return deserializeDate({ date, content, analysis });
      } catch (error) {
        handleSWRError(error);
      }
    },
  );
}
