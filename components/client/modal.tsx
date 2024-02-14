"use client";

import { useEffect, useRef } from "react";
import { createErrorMessage } from "@/utils/error";

export function ErrorAlert({
  isError,
  error,
}: Readonly<{
  isError: boolean;
  error?: Error | null;
}>) {
  const modal = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!modal.current) throw new Error("Modal in null");

    isError ? modal.current.showModal() : modal.current.close();
  }, [isError]);

  return (
    <dialog
      id="my_modal_1"
      className="modal modal-bottom sm:modal-middle"
      ref={modal}
    >
      <div className="modal-box bg-error p-0">
        <div role="alert" className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{createErrorMessage(error)}</span>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
