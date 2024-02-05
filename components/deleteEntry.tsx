"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useRef } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { LoadingSpinner } from "./loading";
import { errorAlert } from "@/utils/error";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export default function DeleteEntry({ id }: Readonly<{ id: string }>) {
  const modal = useRef<HTMLDialogElement | null>(null);
  const loading = useRef<HTMLDialogElement | null>(null);

  const { mutate: deleteEntry, isPending } = useDeleteEntry(
    useQueryClient(),
    useRouter(),
  );

  useEffect(() => {
    if (loading.current)
      isPending ? loading.current.showModal() : loading.current.close();
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
                    deleteEntry({ id });
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
    </>
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
    onError: (error) => {
      errorAlert(error);
    },
  });
}
