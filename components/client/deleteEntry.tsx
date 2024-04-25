"use client";

import { MutableRefObject, useRef, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "../server/loading";
import { createErrorMessage } from "@/utils/error";
import { SetState } from "@/utils/types";
import { deleteEntry } from "@/utils/actions";
import { ErrorAlert } from "./modal";

export default function DeleteEntry({ id }: Readonly<{ id: string }>) {
  const modal = useRef<HTMLDialogElement | null>(null);
  const loading = useRef<HTMLDialogElement | null>(null);

  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!modal.current) throw new Error("Dialog in null");

          modal.current.showModal();
        }}
        className="btn btn-outline btn-error hover:btn-error"
      >
        <div className="flex w-20 items-center justify-between">
          <AiOutlineDelete className="text-xl" />
          <span>Delete</span>
        </div>
      </button>
      <ConfirmationModal
        id={id}
        loading={loading}
        modal={modal}
        setError={setError}
        setIsError={setIsError}
      />
      <ErrorAlert isError={isError} error={error} />
    </>
  );
}

function ConfirmationModal({
  modal,
  loading,
  setError,
  setIsError,
  id,
}: Readonly<{
  modal: MutableRefObject<HTMLDialogElement | null>;
  loading: MutableRefObject<HTMLDialogElement | null>;
  setError: SetState<Error | null>;
  setIsError: SetState<boolean>;
  id: string;
}>) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return (
    <dialog className="modal modal-bottom sm:modal-middle" ref={modal}>
      <div className="prose modal-box">
        <h3 className="font-bold">Are you sure?</h3>
        <p>Once you delete the entry, it can not be recovered.</p>
        <div className="modal-action">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
              ✕
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  loading.current?.showModal();

                  deleteEntry(id)
                    .then(async () => {
                      await queryClient.invalidateQueries({
                        queryKey: ["entries"],
                      });

                      router.replace(`/journal`);
                    })
                    .catch((error: unknown) => {
                      setIsError(true);
                      setError(new Error(createErrorMessage(error)));
                    })
                    .finally(() => {
                      loading.current?.close();
                    });
                }}
                className="btn btn-outline btn-error hover:btn-error"
              >
                Yes
              </button>
              <dialog
                className="bg-transparent backdrop:backdrop-brightness-75"
                ref={loading}
              >
                <LoadingSpinner />
              </dialog>
              <button className="btn btn-outline">No</button>
            </div>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
