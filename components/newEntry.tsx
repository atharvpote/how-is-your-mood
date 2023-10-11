"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AiOutlinePlus } from "react-icons/ai";
import { displayError } from "@/utils/client";
import axios from "axios";

export default function NewEntry() {
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  return (
    <button
      aria-label="new entry"
      onClick={() => {
        setCreating(true);

        axios
          .post<{ id: string }>("/api/journal")
          .then(({ data: { id } }) => router.push(`/journal/${id}`))
          .catch((error) => displayError(error))
          .finally(() => setCreating(false));
      }}
      className="btn bg-neutral text-neutral-content hover:bg-neutral-focus"
    >
      {creating ? (
        <div className="grid w-16 place-content-center text-neutral-content/50">
          <span className="loading loading-infinity"></span>
        </div>
      ) : (
        <div className="flex w-16 items-center justify-between">
          <AiOutlinePlus className="text-lg" />
          <span className="text-lg capitalize">New</span>
        </div>
      )}
    </button>
  );
}
