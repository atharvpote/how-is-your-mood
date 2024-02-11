"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { MutableRefObject, useEffect, useRef } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { LoadingSpinner } from "../server/loading";
import {
  QueryClient,
  UseMutateFunction,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ErrorAlert } from "./modal";
import { handleModal } from "@/utils";

export default function DeleteEntry({ id }: Readonly<{ id: string }>) {
  const modal = useRef<HTMLDialogElement | null>(null);
  const loading = useRef<HTMLDialogElement | null>(null);

  const {
    mutate: deleteEntry,
    isPending,
    isError,
    error,
  } = useDeleteEntry(useQueryClient(), useRouter());

  useEffect(() => {
    handleModal(loading, isPending);
  }, [isPending]);

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
        deleteEntry={deleteEntry}
        id={id}
        loadingRef={loading}
        modalRef={modal}
      />
      <ErrorAlert isError={isError} error={error} />
    </>
  );
}

function ConfirmationModal({
  modalRef,
  loadingRef,
  deleteEntry,
  id,
}: Readonly<{
  modalRef: MutableRefObject<HTMLDialogElement | null>;
  loadingRef: MutableRefObject<HTMLDialogElement | null>;
  deleteEntry: UseMutateFunction<
    void,
    Error,
    {
      id: string;
    }
  >;
  id: string;
}>) {
  return (
    <dialog className="modal modal-bottom sm:modal-middle" ref={modalRef}>
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
                  deleteEntry({ id });
                }}
                className="btn btn-outline btn-error hover:btn-error"
              >
                Yes
              </button>
              <dialog
                className="bg-transparent backdrop:backdrop-brightness-75"
                ref={loadingRef}
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

function useDeleteEntry(queryClient: QueryClient, router: AppRouterInstance) {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await axios.delete(`/api/entry/${id}`);
    },
    onSuccess: async (_, { id }) => {
      router.replace("/journal/");

      await queryClient.invalidateQueries({ queryKey: [`/api/entry/${id}`] });
      await queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}
