"use client";

import { useState } from "react";
import { JournalEntry } from "@prisma/client";
import { useAutosave } from "react-autosave";
import { updateEntry } from "@/utils/api";

export default function Editor({ entry }: { entry: JournalEntry }) {
  const [value, setValue] = useState(entry.content);

  useAutosave({
    data: value,
    onSave: async (value) => {
      await updateEntry(entry.id, value);
    },
  });

  return (
    <textarea
      value={value}
      spellCheck={true}
      onChange={(event) => setValue(event.target.value)}
      className="outline-none w-full h-full block p-8 text-xl resize-none"
    />
  );
}
