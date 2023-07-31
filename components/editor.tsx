"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Analysis, Journal } from "@prisma/client";
import { useAutosave } from "react-autosave";
import { AiOutlineDelete } from "react-icons/ai";
import { z } from "zod";
import {
  deleteEntry,
  errorAlert,
  updateContent,
  updateDate,
} from "@/utils/client";
import { TopLoadingSpinner } from "./loading";

interface PropTypes {
  entry: Journal;
  analysis: Analysis;
}

export default function Editor({ entry, analysis }: PropTypes) {
  const [content, setContent] = useState(entry.content);
  const [date, setDate] = useState(entry.date);
  const [localAnalysis, setLocalAnalysis] = useState(analysis);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const previous = useRef(content);
  const modal = useRef<HTMLDialogElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useAutosave({
    data: content,
    onSave: async (content) => {
      if (content.trim() !== previous.current.trim()) {
        setLoadingAnalysis(true);

        try {
          const data = await updateContent(content, entry.id);

          setLocalAnalysis(data.analysis);
          previous.current = content;
        } catch (error) {
          errorAlert(error);
        } finally {
          setLoadingAnalysis(false);
        }
      }
    },
  });

  return (
    <div className="h-0 min-h-full lg:flex">
      <div className="lg:basis-full">
        <div className="flex justify-between p-4">
          <div className="tooltip tooltip-right" data-tip="Date of Entry">
            <h2 className="text-lg font-medium text-accent">
              <input
                type="date"
                value={new Date(date).toISOString().split("T")[0]}
                ref={dateRef}
                onKeyDown={() => false}
                onFocus={() => dateRef.current?.showPicker()}
                onChange={(event) => {
                  try {
                    z.string()
                      .datetime()
                      .parse(event.target.value + "T00:00:00Z");

                    const date = new Date(event.target.value);

                    setDate(date);

                    void updateDate(date, entry.id);
                  } catch (error) {
                    errorAlert(error);
                  }
                }}
                className="cursor-pointer rounded-lg bg-base-200 px-4 py-2 focus:bg-base-300"
              />
            </h2>
          </div>
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

                      void deleteEntry(entry.id)
                        .then(() => router.replace("/journal/"))
                        .catch((error) => errorAlert(error));
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
          <table className="table mb-4">
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
                <td className="text-base">
                  {localAnalysis.subject.length
                    ? localAnalysis.summery[0].toUpperCase() +
                      localAnalysis.summery.slice(1)
                    : ""}
                </td>
              </tr>
              <tr>
                <th className="flex items-start">
                  <span className="text-base">Sentiment Score</span>
                </th>
                <td className="text-base ">{localAnalysis.sentiment}</td>
              </tr>
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
