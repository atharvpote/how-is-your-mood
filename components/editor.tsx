"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import axios, { AxiosError } from "axios";
import { format } from "date-fns";
import { useAutosave } from "react-autosave";
import { AiOutlineDelete } from "react-icons/ai";
import { Analysis as AnalysisType } from "@prisma/client";
import { errorAlert, showPicker } from "@/utils";
import { AlertInfo } from "./alerts";
import { Entry } from "./entries";
import { LoadingSpinner } from "./loading";

export type EntryAnalysis = Pick<
  AnalysisType,
  "sentiment" | "mood" | "emoji" | "subject" | "summery"
>;

interface PropTypes {
  entry: Entry;
  entryAnalysis: EntryAnalysis;
}

export default function Editor({ entry, entryAnalysis }: PropTypes) {
  const { data: upstreamDate } = useEntryDate(entry.id);

  const [content, setContent] = useState(entry.content);
  const [analysis, setAnalysis] = useState(entryAnalysis);
  const [date, setDate] = useState(entry.date);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [touchDevice, setTouchDevice] = useState(false);
  const [scroll, setScroll] = useState(false);

  const modal = useRef<HTMLDialogElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const previous = useRef(content);
  const cache = useRef(
    new Map<string, EntryAnalysis>([[content.trim(), entryAnalysis]]),
  );

  const router = useRouter();

  useEffect(() => {
    if (upstreamDate) setDate(new Date(upstreamDate));

    isTouchDevice() ? setTouchDevice(true) : setTouchDevice(false);

    if (textarea.current)
      if (textarea.current.scrollHeight > textarea.current.clientHeight)
        setScroll(true);
      else setScroll(false);
  }, [upstreamDate]);

  useAutosave({
    data: content,
    onSave: (content) => {
      const trimmedContent = content.trim();

      if (trimmedContent !== previous.current) {
        previous.current = trimmedContent;

        const cachedAnalysis = cache.current.get(trimmedContent);

        if (cachedAnalysis) {
          setAnalysis(cachedAnalysis);

          axios
            .put(`/api/journal/${entry.id}/write`, {
              content,
              analysis: cachedAnalysis,
            })
            .catch((error) => errorAlert(error));
        } else {
          setLoading(true);

          axios
            .put<{ analysis: EntryAnalysis }>(`/api/journal/${entry.id}`, {
              content,
            })
            .then(({ data: { analysis } }) => {
              setAnalysis(analysis);

              cache.current.set(trimmedContent, analysis);
            })
            .catch((error) => errorAlert(error))
            .finally(() => setLoading(false));
        }
      }
    },
  });

  return (
    <div className="px-4 md:flex md:h-[100%] lg:pl-8">
      <div className="h-[calc(100vh-11rem)] sm:h-[calc(100vh-7rem)] md:h-[calc(100%-1rem)] md:grow md:basis-full">
        <div className="flex items-center justify-between py-4">
          {/* Entry Date */}
          <div
            className={!touchDevice ? "tooltip tooltip-right" : ""}
            data-tip="Date of Entry"
          >
            <span className="text-lg font-medium text-neutral-content">
              <input
                type="date"
                className="h-12 w-36 cursor-pointer rounded-lg bg-neutral p-2 pr-0 font-semibold focus:bg-neutral-focus"
                value={format(date, "yyyy-MM-dd")}
                ref={input}
                onClick={showPicker(input)}
                onFocus={showPicker(input)}
                onChange={({ target: { value } }) => {
                  const date = new Date(value);

                  setDate(date);

                  axios
                    .put(`/api/journal/${entry.id}/date`, { date })
                    .catch((error) => errorAlert(error));
                }}
              />
            </span>
          </div>
          {/* Delete Entry */}
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
                          .delete(`/api/journal/${entry.id}`)
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
        </div>
        <div className="h-[calc(100%-5rem)]">
          <textarea
            value={content}
            spellCheck={true}
            onChange={({ target: { value, clientHeight, scrollHeight } }) => {
              setContent(value);

              scrollHeight > clientHeight ? setScroll(true) : setScroll(false);
            }}
            className={`textarea h-full w-full resize-none rounded-lg bg-neutral px-6 py-4 text-base leading-loose text-neutral-content ${
              !touchDevice && scroll ? "rounded-r-none" : ""
            }`}
            ref={textarea}
          />
        </div>
      </div>
      <div className="divider md:divider-horizontal md:grow-0" />
      <section className="prose sm:mx-auto sm:max-w-2xl md:h-full md:grow-0 md:basis-96 md:self-start">
        <div>
          <h2 className="font-bold md:mt-6">Analysis</h2>
        </div>
        <div className="pb-4 md:relative md:h-[calc(100%-5.3rem)] md:p-0">
          {loading ? (
            <div className="left-1/2 top-1/2 -translate-x-1/2 translate-y-[calc(-50%-1.5rem)] md:absolute">
              <LoadingSpinner />
            </div>
          ) : (
            <Analysis content={content} analysis={analysis} />
          )}
        </div>
      </section>
    </div>
  );
}

function useEntryDate(id: string) {
  return useSWR<Date, AxiosError>(`/api/journal/${id}`, async (url: string) => {
    const {
      data: { date },
    } = await axios.get<{ date: Date }>(url);

    return date;
  });
}

function isTouchDevice() {
  return window.matchMedia("(any-pointer: coarse)").matches;
}

interface AnalysisProps {
  content: string;
  analysis: EntryAnalysis;
}

function Analysis({ content, analysis }: AnalysisProps) {
  const table = [
    {
      name: "Mood",
      td: (
        <td className="flex basis-full items-center gap-2">
          <div className="font-bold capitalize">{analysis.mood}</div>
          <div className="">{analysis.emoji}</div>
        </td>
      ),
    },
    {
      name: "Subject",
      td: <td className="basis-full capitalize">{analysis.subject}</td>,
    },
    {
      name: "Summery",
      td: (
        <td className="basis-full">
          {analysis.subject.length
            ? analysis.summery[0].toUpperCase() + analysis.summery.slice(1)
            : ""}
        </td>
      ),
    },
    {
      name: "Sentiment Score",
      td: (
        <td className="basis-full">
          <span className="font-bold">{analysis.sentiment}</span>
          /10
        </td>
      ),
    },
  ];

  return content.trim().length !== 0 ? (
    <table className="table">
      <tbody>
        {table.map(({ name, td }) => (
          <tr className="flex items-start text-base" key={name}>
            <th className="basis-44">
              <span className="">{name}</span>
            </th>
            {td}
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <div className="top-1/2 translate-y-[calc(-50%-1.5rem)] md:absolute">
      <AlertInfo message="Write something about your day!" />
    </div>
  );
}
