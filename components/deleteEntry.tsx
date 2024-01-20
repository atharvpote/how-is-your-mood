"use client";

import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useRef } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { LoadingSpinner } from "./loading";
import { errorAlert } from "@/utils/error";

export default function DeleteEntry() {
  const { id } = useParams();

  if (!id || Array.isArray(id)) {
    throw new Error("Entry ID is undefined");
  }

  const modal = useRef<HTMLDialogElement | null>(null);
  const loading = useRef<HTMLDialogElement | null>(null);

  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!modal.current) {
            throw new Error("Dialog in null");
          }

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
                    if (!loading.current) {
                      throw new Error("Modal is null");
                    }

                    loading.current.showModal();

                    axios
                      .delete(`/api/entry/${id}`)
                      .then(() => {
                        router.replace("/journal/");
                      })
                      .catch((error) => {
                        errorAlert(error);
                      })
                      .finally(() => {
                        if (!loading.current) {
                          throw new Error("Modal is null");
                        }

                        loading.current.close();
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
    </>
  );
}
