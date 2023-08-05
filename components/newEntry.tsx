"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AiOutlinePlusSquare } from "react-icons/ai";
import { errorAlert, createEntry } from "@/utils/client";

export default function NewEntry() {
  const [creatingNewEntry, setCreatingNewEntry] = useState(false);
  const router = useRouter();

  return (
    <div className="tooltip tooltip-left" data-tip="New">
      <button
        aria-label="new entry"
        key="new"
        onClick={() => {
          setCreatingNewEntry(true);

          createEntry()
            .then((id) => router.push(`/journal/${id}`))
            .catch((error) => errorAlert(error))
            .finally(() => setCreatingNewEntry(false));
        }}
        className="btn btn-square"
      >
        {creatingNewEntry ? (
          <span className="loading loading-infinity"></span>
        ) : (
          <div className="">
            <AiOutlinePlusSquare className="text-3xl" />
          </div>
        )}
      </button>
    </div>
  );
}
