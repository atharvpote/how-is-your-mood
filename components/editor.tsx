"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { useAutosave } from "react-autosave";
import { Analysis } from "@prisma/client";
import { displayError } from "@/utils/client";
import { LoadingSpinner } from "./loading";
import DeleteJournalEntry from "./deleteJournalEntry";
import JournalDate from "./journalDate";
import AnalysisTable from "./analysisTable";
import { Entry } from "./entries";

export type EntryAnalysis = Pick<
  Analysis,
  "sentiment" | "mood" | "emoji" | "subject" | "summery"
>;

interface PropTypes {
  entry: Entry;
  entryAnalysis: EntryAnalysis;
}

export default function Editor({ entry, entryAnalysis }: PropTypes) {
  const [content, setContent] = useState(entry.content);
  const [analysis, setAnalysis] = useState(entryAnalysis);
  const [loading, setLoading] = useState(false);

  const previous = useRef(content);
  const cache = useRef(
    new Map<string, EntryAnalysis>([[content.trim(), entryAnalysis]]),
  );

  useAutosave({
    data: content,
    onSave: (content) => {
      const trimmedContent = content.trim();

      if (trimmedContent !== previous.current) {
        previous.current = trimmedContent;

        const cachedAnalysis = cache.current.get(trimmedContent);

        if (cachedAnalysis) {
          setAnalysis(cachedAnalysis);

          axios
            .put(`/api/journal/${entry.id}/write`, {
              content,
              analysis: cachedAnalysis,
            })
            .catch((error) => displayError(error));
        } else {
          setLoading(true);

          axios
            .put<{ analysis: EntryAnalysis }>(`/api/journal/${entry.id}`, {
              content,
            })
            .then(({ data: { analysis } }) => {
              setAnalysis(analysis);

              cache.current.set(trimmedContent, analysis);
            })
            .catch((error) => displayError(error))
            .finally(() => setLoading(false));
        }
      }
    },
  });

  return (
    <div className="h-0 min-h-full lg:flex lg:pl-4">
      <div className="lg:basis-full">
        <div className="flex items-center justify-between p-4">
          <JournalDate entryDate={entry.date} entryId={entry.id} />
          <DeleteJournalEntry entryId={entry.id} />
        </div>
        <div className="mx-4 h-[60vh] lg:mr-0 lg:h-[calc(100%-5.4rem)] lg:pb-2">
          <textarea
            value={content}
            spellCheck={true}
            onChange={(event) => setContent(event.target.value)}
            className="textarea h-full w-full resize-none rounded-lg bg-neutral px-6 py-4 text-base text-neutral-content"
          />
        </div>
      </div>
      <div className="divider lg:divider-horizontal lg:basis-auto"></div>
      <section className="mx-4 overflow-x-auto lg:mx-0 lg:basis-2/5">
        <h2 className="my-6 text-2xl font-bold">Analysis</h2>
        {loading ? (
          <div className="lg:grid lg:h-[calc(100%-5.4rem)] lg:place-content-center">
            <LoadingSpinner />
          </div>
        ) : (
          <ShowAnalysis content={content} analysis={analysis} />
        )}
      </section>
    </div>
  );
}

interface AnalysisProps {
  content: string;
  analysis: EntryAnalysis;
}

function ShowAnalysis({ content, analysis }: AnalysisProps) {
  return content.trim().length !== 0 ? (
    <div className="pb-8">
      <AnalysisTable analysis={analysis} />
    </div>
  ) : (
    <div className="pb-4 lg:pr-4">
      <div className="alert alert-info">Write something about your day.</div>
    </div>
  );
}
