"use client";

import { useEffect, useRef, useState } from "react";
import { Analysis, JournalEntry } from "@prisma/client";
import { useAutosave } from "react-autosave";
import { createURL } from "@/utils/api";

interface PropTypes {
  id?: string;
}

export default function Editor({ id }: PropTypes) {
  const [content, setContent] = useState("");
  const [entryLoading, setEntryLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [entryID, setEntryID] = useState(id);
  const [date, setDate] = useState<string>("");
  const [analysis, setAnalysis] = useState<Analysis | undefined>(undefined);

  const previous = useRef(content);

  const analyses = getAnalysis(analysis);

  useEffect(() => {
    if (entryID) {
      setEntryLoading(true);

      void getEntry(entryID).then((data) => {
        if (data) {
          setAnalysis(data.analysis);
          setContent(data.entry.content);
          setDate(new Date(data.entry.createdAt).toDateString());
        }

        setEntryLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAutosave({
    data: content,
    onSave: async (content) => {
      if (content.trim() !== previous.current.trim()) {
        setAnalysisLoading(true);

        const data = await upsert(content, entryID);

        if (!entryID) setEntryID(data?.analysis.entryId);

        setAnalysis(data?.analysis);
        setAnalysisLoading(false);

        previous.current = content;
      }
    },
  });

  return (
    <div className="h-0 min-h-full">
      {entryLoading ? (
        <div className="grid h-full place-content-center">
          <span className="loading loading-infinity loading-lg"></span>
        </div>
      ) : (
        <div className="h-0 min-h-full">
          <div className="p-4">
            <h2 className="text-lg font-medium">{date}</h2>
          </div>
          <div className="h-3/5">
            <textarea
              value={content}
              onChange={(event) => {
                setContent(event.target.value);
              }}
              className="textarea h-full w-full resize-none rounded-none bg-base-200 text-base"
            />
          </div>
          <div className="divider"></div>
          <div className="overflow-x-auto">
            {analysisLoading ? (
              <span className="loading loading-infinity loading-lg mx-auto block"></span>
            ) : (
              <table className="table">
                <tbody>
                  {analyses.map((analysis) => (
                    <tr key={analysis.name}>
                      <th className="capitalize">{analysis.name}</th>
                      <td>{analysis.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getAnalysis(analysis: Analysis | undefined) {
  return analysis
    ? [
        { name: "summery", value: analysis.summery },
        { name: "color", value: analysis.color },
        { name: "subject", value: analysis.subject },
        { name: "mood", value: analysis.mood },
        { name: "negative", value: analysis.negative ? "True" : "False" },
      ]
    : [
        { name: "summery", value: "" },
        { name: "color", value: "" },
        { name: "subject", value: "" },
        { name: "mood", value: "" },
        { name: "negative", value: "False" },
      ];
}

async function getEntry(id: string) {
  const response = await fetch(
    new Request(createURL(`/api/journal/entry/${id}`)),
    {
      method: "GET",
    },
  );

  if (response.ok) {
    const data = (await response.json()) as {
      entry: JournalEntry;
      analysis: Analysis;
    };

    return data;
  }
}

async function upsert(content: string, id?: string) {
  if (id) return updateEntry(content, id);

  return createEntry(content);
}

async function updateEntry(content: string, id: string) {
  const response = await fetch(
    new Request(createURL(`/api/journal/entry/${id}`), {
      method: "PUT",
      body: JSON.stringify({ content }),
    }),
  );

  if (!response.ok) throw new Error("Failed to update entry");

  const data = (await response.json()) as { analysis: Analysis };

  return { analysis: data.analysis };
}

async function createEntry(content: string) {
  const response = await fetch(
    new Request(createURL("/api/journal/entry"), {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  );

  if (response.ok) {
    const data = (await response.json()) as {
      analysis: Analysis;
    };

    return data;
  }
}
