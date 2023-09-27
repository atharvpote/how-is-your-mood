"use client";

import { useRef, useState } from "react";
import { useAutosave } from "react-autosave";
import { displayError, updateContent } from "@/utils/client";
import { LoadingSpinner } from "./loading";
import DeleteEntry from "./deleteEntry";
import EntryDate from "./entryDate";
import AnalysisTable from "./analysisTable";
import { EntryAnalysis } from "@/utils/server";
import { Entry } from "@/utils/hooks";

interface PropTypes {
  entry: Entry;
  analysis: EntryAnalysis;
}

export default function Editor({ entry, analysis }: PropTypes) {
  const [content, setContent] = useState(entry.content);
  const [analysisState, setAnalysisState] = useState(analysis);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const previous = useRef(content);

  useAutosave({
    data: content,
    onSave: (content) => {
      if (content.trim() !== previous.current.trim()) {
        setLoadingAnalysis(true);

        updateContent(content, entry.id)
          .then((analysis) => {
            setAnalysisState(analysis);
            previous.current = content;
          })
          .catch((error) => displayError(error))
          .finally(() => setLoadingAnalysis(false));
      }
    },
  });

  return (
    <div className="h-0 min-h-full lg:flex">
      <div className="lg:basis-full">
        <div className="flex items-center justify-between p-4">
          <EntryDate entryDate={entry.date} entryId={entry.id} />
          <DeleteEntry entryId={entry.id} />
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
        {loadingAnalysis ? (
          <div className="lg:grid lg:h-[calc(100%-5.4rem)] lg:place-content-center">
            <LoadingSpinner />
          </div>
        ) : (
          content.trim().length !== 0 && (
            <div className="pb-8">
              <AnalysisTable analysis={analysisState} />
            </div>
          )
        )}
      </section>
    </div>
  );
}
