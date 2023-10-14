"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AiOutlineDelete } from "react-icons/ai";
import { displayError } from "@/utils/client";

export default function DeleteJournalEntry({ entryId }: { entryId: string }) {
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
      <dialog
        id="my_modal_1"
        className="modal modal-bottom sm:modal-middle"
        ref={modal}
      >
        <form method="dialog" className="modal-box">
          <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
            ✕
          </button>
          <h3 className="text-lg font-bold">Are you sure</h3>
          <p className="py-4">
            Once you delete the entry, it can not be recovered.
          </p>
          <div className="modal-action">
            {/* if there is a button in form, it will close the modal */}
            <button
              onClick={() => {
                setDeleting(true);

                axios
                  .delete(`/api/journal/${entryId}`)
                  .then(() => router.replace("/journal/"))
                  .catch((error) => displayError(error))
                  .finally(() => setDeleting(false));
              }}
              className="btn btn-error btn-outline"
            >
              Yes
            </button>
            <button className="btn btn-outline">No</button>
          </div>
        </form>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}