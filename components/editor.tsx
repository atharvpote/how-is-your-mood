"use client";

import { useRef, useState } from "react";
import { Analysis, JournalEntry } from "@prisma/client";
import { useAutosave } from "react-autosave";
import { updateEntry } from "@/utils/api";

interface PropTypes {
  entry: JournalEntry;
  analysis?: Analysis;
}

export default function Editor(props: PropTypes) {
  const [value, setValue] = useState(props.entry.content);
  const [analysis, setAnalysis] = useState(props.analysis);
  const previous = useRef(value);

  const analysisData = [
    { name: "summery", value: analysis.summery },
    { name: "subject", value: analysis.subject },
    { name: "mood", value: analysis.mood },
    { name: "negative", value: analysis.negative ? "True" : "False" },
  ];

  useAutosave({
    data: value,
    onSave: async (value) => {
      if (value.trim() !== previous.current.trim()) {
        const update = await updateEntry(props.entry.id, value);

        if (update) {
          setAnalysis(update.analysis);
          previous.current = update.data.content;
        }
      }
    },
  });

  return (
    <div className="grid grid-cols-3 min-h-full h-fit">
      <div className="col-span-2">
        <textarea
          value={value}
          spellCheck={true}
          placeholder="Write about your day."
          onChange={(event) => setValue(event.target.value)}
          className="outline-none w-full h-full block p-8 text-xl resize-none"
        />
      </div>
      <div className="border-l border-black/10">
        <div
          className="px-6 py-10"
          style={{ backgroundColor: `${analysis.color ? analysis.color : ""}` }}
        >
          <h2 className="text-2xl">Analysis</h2>
        </div>
        <div>
          <ul>
            {analysisData.map(({ name, value }) => (
              <li
                key={name}
                className="flex items-center justify-between px-2 py-4 border-y border-black/10 capitalize"
              >
                <span className="text-lg font-semibold">{name}</span>
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
