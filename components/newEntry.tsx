"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AiOutlinePlus } from "react-icons/ai";
import { errorAlert } from "@/utils/error";
import { LoadingSpinner } from "./loading";

export default function NewEntry() {
  const loading = useRef<HTMLDialogElement | null>(null);

  const router = useRouter();

  return (
    <>
      <button
        aria-label="new entry"
        onClick={() => {
          if (!loading.current) throw new Error("Modal is null");

          loading.current.showModal();

          axios
            .post<{ id: string }>("/api/entry")
            .then(({ data: { id } }) => {
              router.push(`/journal/${id}`);
            })
            .catch((error) => {
              errorAlert(error);
            })
            .finally(() => {
              if (!loading.current) throw new Error("Modal is null");

              loading.current.close();
            });
        }}
        className="btn bg-neutral text-neutral-content hover:bg-neutral-800"
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
    </>
  );
}
