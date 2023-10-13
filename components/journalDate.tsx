"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import axios, { AxiosError } from "axios";
import { format } from "date-fns";
import { displayError } from "@/utils/client";

interface PropTypes {
  entryDate: Date;
  entryId: string;
}

export default function JournalDate({ entryDate, entryId }: PropTypes) {
  const [date, setDate] = useState(entryDate);
  const { data: upstreamDate } = useEntryDate(entryId);

  const input = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (upstreamDate) setDate(new Date(upstreamDate));
  }, [upstreamDate]);

  return (
    <div className="lg:tooltip lg:tooltip-right" data-tip="Date of Entry">
      <span className="text-lg font-medium text-neutral-content">
        <input
          type="date"
          className="w-32 cursor-pointer rounded-lg bg-neutral p-2 text-center focus:bg-neutral-focus"
          value={format(date, "yyyy-MM-dd")}
          ref={input}
          onClick={() => {
            input.current?.showPicker();
          }}
          onFocus={() => {
            input.current?.showPicker();
          }}
          onChange={({ target: { value } }) => {
            const date = new Date(value);

            setDate(date);

            axios
              .put(`/api/journal/${entryId}/date`, { date })
              .catch((error) => displayError(error));
          }}
        />
      </span>
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
