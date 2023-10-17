"use client";

import { useRouter } from "next/navigation";
import { errorAlert } from "@/utils";
import axios from "axios";
import { useRef, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";

export default function DeleteEntry({ id }: { id: string }) {
  const [deleting, setDeleting] = useState(false);

  const modal = useRef<HTMLDialogElement>(null);

  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => modal.current?.showModal()}
        className="btn btn-error btn-outline"
      >
        {deleting ? (
          <span className="loading loading-infinity loading-md" />
        ) : (
          <div className="flex w-20 items-center justify-between">
            <AiOutlineDelete className="text-xl" />
            <span>Delete</span>
          </div>
        )}
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
                    setDeleting(true);

                    axios
                      .delete(`/api/entry/${id}`)
                      .then(() => router.replace("/journal/"))
                      .catch((error) => errorAlert(error))
                      .finally(() => setDeleting(false));
                  }}
                  className="btn btn-error"
                >
                  Yes
                </button>
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
