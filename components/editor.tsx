"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Analysis, JournalEntry } from "@prisma/client";
import { useAutosave } from "react-autosave";
import { AiOutlineDelete } from "react-icons/ai";
import { createURL } from "@/utils/api";
import { TopLoadingSpinner } from "./loading";

interface PropTypes {
  entry: JournalEntry;
  analysis: Analysis;
}

export default function Editor({ entry, analysis }: PropTypes) {
  const [content, setContent] = useState(entry.content);
  const [date, setDate] = useState<Date>(entry.entryDate);
  const [localAnalysis, setLocalAnalysis] = useState<Analysis>(analysis);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();

  const previous = useRef(content);
  const modal = useRef<HTMLDialogElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  useAutosave({
    data: content,
    onSave: async (content) => {
      if (content.trim() !== previous.current.trim()) {
        setLoadingAnalysis(true);

        const data = await updateContent(content, entry.id);
        setLocalAnalysis(data.analysis);

        setLoadingAnalysis(false);

        previous.current = content;
      }
    },
  });

  return (
    <div className="h-0 min-h-full lg:flex">
      <div className="lg:basis-full">
        <div className="flex justify-between p-4">
          <h2 className="text-lg font-medium">
            <input
              type="date"
              value={new Date(date).toISOString().split("T")[0]}
              ref={dateRef}
              onKeyDown={(e) => e.preventDefault()}
              onFocus={() => dateRef.current?.showPicker()}
              onChange={(event) => {
                const date = new Date(event.target.value);

                setDate(date);

                void updateDate(date, entry.id);
              }}
              className="cursor-pointer rounded-lg bg-base-200 px-4 py-2 focus:bg-base-300"
            />
          </h2>
          <div className="tooltip tooltip-left" data-tip="Delete">
            <button
              type="button"
              onClick={() => modal.current?.showModal()}
              className="btn to-base-200 active:bg-base-300"
            >
              {deleting ? (
                <span className="loading loading-infinity loading-md " />
              ) : (
                <AiOutlineDelete className="text-xl" />
              )}
            </button>
            <dialog
              id="my_modal_1"
              className="modal modal-bottom sm:modal-middle"
              ref={modal}
            >
              <form method="dialog" className="modal-box">
                <button className="btn-ghost btn-sm btn-circle btn absolute right-2 top-2">
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

                      void deleteEntry(entry.id).then(() => {
                        router.replace("/journal/");

                        setDeleting(false);
                      });
                    }}
                    className="btn bg-red-300 hover:bg-red-400 active:bg-red-500 dark:bg-red-800 dark:hover:bg-red-900 dark:active:bg-red-950"
                  >
                    Yes
                  </button>
                  <button className="btn">No</button>
                </div>
              </form>
              <form method="dialog" className="modal-backdrop">
                <button>close</button>
              </form>
            </dialog>
          </div>
        </div>
        <div className="mx-4 h-[60vh] lg:mr-0 lg:h-[calc(100%-5.4rem)] lg:pb-2">
          <textarea
            value={content}
            spellCheck={true}
            onChange={(event) => setContent(event.target.value)}
            className="textarea h-full w-full resize-none rounded-lg bg-base-200 px-6 py-4 text-base"
          />
        </div>
      </div>
      <div className="divider lg:divider-horizontal lg:basis-auto"></div>
      <section className="mx-4 overflow-x-auto lg:mx-0 lg:basis-2/5">
        <h2 className="my-6 text-2xl font-medium">Analysis</h2>
        {loadingAnalysis ? (
          <TopLoadingSpinner />
        ) : (
          <table className="mb-4 table">
            <tbody>
              <tr>
                <th>
                  <span className="text-base">Mood</span>
                </th>
                <td className="flex items-center gap-2 text-base">
                  <div className="font-bold capitalize">
                    {localAnalysis.mood}
                  </div>
                  <div className="text-xl">
                    {localAnalysis.emoji.length
                      ? String.fromCodePoint(Number(localAnalysis.emoji))
                      : ""}
                  </div>
                </td>
              </tr>
              <tr>
                <th className="flex items-start">
                  <span className="text-base">Subject</span>
                </th>
                <td className="text-base capitalize">
                  {localAnalysis.subject}
                </td>
              </tr>
              <tr>
                <th className="flex items-start">
                  <span className="text-base">Summery</span>
                </th>
                <td className="text-base ">{localAnalysis.summery}</td>
              </tr>
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

async function updateContent(content: string, id: string) {
  const response = await fetch(
    new Request(createURL(`/api/journal/entry/${id}`), {
      method: "PUT",
      body: JSON.stringify({ type: "content", content }),
    }),
  );

  if (!response.ok) throw new Error("Failed to update content");

  const data = (await response.json()) as { analysis: Analysis };

  return { analysis: data.analysis };
}

async function updateDate(date: Date, id: string) {
  const response = await fetch(
    new Request(createURL(`/api/journal/entry/${id}`), {
      method: "PUT",
      body: JSON.stringify({ type: "date", date }),
    }),
  );

  if (!response.ok) throw new Error("Failed to update date");
}

async function deleteEntry(id: string) {
  const response = await fetch(
    new Request(createURL(`/api/journal/entry/${id}`)),
    { method: "DELETE" },
  );

  if (!response.ok) throw new Error("Failed to delete entry");
}
