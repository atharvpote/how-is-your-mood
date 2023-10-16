"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AiOutlinePlus } from "react-icons/ai";
import { errorAlert } from "@/utils";

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
          .catch((error) => errorAlert(error))
          .finally(() => setCreating(false));
      }}
      className="btn bg-neutral text-neutral-content hover:bg-neutral-focus"
    >
      {creating ? (
        <div className="flex w-16 items-center justify-center text-neutral-content/75">
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
