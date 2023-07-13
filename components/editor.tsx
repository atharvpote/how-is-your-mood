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
  const [loading, setLoading] = useState(false);
  const [entryID, setEntryID] = useState(id);
  const [analysis, setAnalysis] = useState<Analysis | undefined>(undefined);

  const previous = useRef(content);

  const analyses = getAnalysis(analysis);

  useEffect(() => {
    if (entryID) {
      setLoading(true);

      void getEntry(entryID).then((data) => {
        if (data) {
          setAnalysis(data.analysis);
          setContent(data.entry.content);
        }

        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAutosave({
    data: content,
    onSave: async (content) => {
      if (content.trim() !== previous.current.trim()) {
        const data = await upsert(content, entryID);

        if (!entryID) setEntryID(data?.analysis.entryId);

        setAnalysis(data?.analysis);
        previous.current = content;
      }
    },
  });

  return loading ? (
    <div>Loading...</div>
  ) : (
    <div className="grid grid-cols-3 min-h-full h-fit">
      <div className="col-span-2">
        <textarea
          value={content}
          spellCheck={true}
          placeholder="Write about your day."
          onChange={(event) => setContent(event.target.value)}
          className="outline-none w-full h-full block p-8 text-xl resize-none"
        />
      </div>
      <div className="border-l border-black/10">
        <div
          className="px-6 py-10"
          style={{
            backgroundColor: `${analysis?.color ? analysis.color : ""}`,
          }}
        >
          <h2 className="text-2xl">Analysis</h2>
        </div>
        <div>
          <ul>
            {analyses.map(({ name, value }) => (
              <li
                key={name}
                className="flex items-center justify-between gap-8 px-2 py-4 border-y border-black/10 capitalize"
              >
                <span className="text-lg font-semibold basis-1/2">{name}</span>
                <div className="flex basis-1/2">
                  <span>{value}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function getAnalysis(analysis: Analysis | undefined) {
  return analysis
    ? [
        { name: "summery", value: analysis.summery },
        { name: "subject", value: analysis.subject },
        { name: "mood", value: analysis.mood },
        { name: "negative", value: analysis.negative ? "True" : "False" },
      ]
    : [
        { name: "summery", value: "" },
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
