"use client";

import { useRef, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createEntry } from "@/utils/actions";
import { createErrorMessage } from "@/utils/error";
import { LoadingSpinner } from "../server/loading";
import { ErrorAlert } from "./modal";

export default function NewEntry() {
  const loading = useRef<HTMLDialogElement | null>(null);

  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();

  return (
    <>
      <button
        aria-label="new entry"
        onClick={() => {
          loading.current?.showModal();

          createEntry()
            .then(async (id) => {
              await queryClient.invalidateQueries({ queryKey: ["entries"] });

              router.push(`/journal/${id}`);
            })
            .catch((error) => {
              setIsError(true);
              setError(new Error(createErrorMessage(error)));
            })
            .finally(() => {
              loading.current?.close();
            });
        }}
        className="btn bg-neutral text-neutral-content hover:scale-105 hover:bg-neutral-800"
      >
        <div className="flex w-16 items-center justify-between">
          <AiOutlinePlus className="text-lg" />
          <span className="text-lg capitalize">New</span>
        </div>
      </button>
      <dialog
        className="bg-transparent backdrop:backdrop-brightness-75"
        ref={loading}
      >
        <LoadingSpinner />
      </dialog>
      <ErrorAlert isError={isError} error={error} />
    </>
  );
}
