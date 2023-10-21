"use client";

import { HistoryDateRangeContext } from "@/contexts/history";
import { isValidDateRange, showPicker } from "@/utils";
import { format } from "date-fns";
import { useContext, useRef } from "react";

export default function HistoryDateRange() {
  const historyDateRangeContext = useContext(HistoryDateRangeContext);

  if (!historyDateRangeContext)
    throw new Error(
      "HistoryContext must be used within HistoryContextProvider",
    );

  const { start, setStart, end, setEnd } = historyDateRangeContext;

  const startRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="form-control">
      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <span>From</span>
        <input
          type="date"
          className={`h-12 cursor-pointer rounded-lg bg-neutral p-2 text-center font-semibold text-neutral-content focus:bg-neutral-focus ${
            isValidDateRange(start, end) ? "outline outline-error" : ""
          }`}
          value={format(start, "yyyy-MM-dd")}
          ref={startRef}
          onClick={showPicker(startRef)}
          onFocus={showPicker(startRef)}
          onChange={({ target: { value } }) => {
            setStart(new Date(value));
          }}
        />
        <span>To</span>
        <input
          type="date"
          className={`h-12 cursor-pointer rounded-lg bg-neutral p-2 text-center font-semibold text-neutral-content focus:bg-neutral-focus ${
            isValidDateRange(start, end) ? "outline outline-error" : ""
          }`}
          value={format(end, "yyyy-MM-dd")}
          ref={endRef}
          onClick={showPicker(endRef)}
          onFocus={showPicker(endRef)}
          onChange={({ target: { value } }) => {
            setEnd(new Date(value));
          }}
        />
      </div>
    </div>
  );
}
