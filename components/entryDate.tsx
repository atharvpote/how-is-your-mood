"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { displayError } from "@/utils/client";
import "react-datepicker/dist/react-datepicker.css";
import "@/style/datePicker.css";
import axios, { AxiosError } from "axios";
import useSWR from "swr";

interface PropTypes {
  entryDate: Date;
  entryId: string;
}

export default function EntryDate({ entryDate, entryId }: PropTypes) {
  const [date, setDate] = useState(new Date(entryDate.toUTCString()));
  const { data: upstreamDate } = useEntryDate(entryId);

  useEffect(() => {
    if (upstreamDate) setDate(new Date(upstreamDate));
  }, [upstreamDate]);

  return (
    <div className="tooltip tooltip-right" data-tip="Date of Entry">
      <span className="text-lg font-medium text-neutral-content">
        <DatePicker
          selected={date}
          onChange={(date) => {
            if (date) {
              setDate(date);

              axios
                .put(`/api/journal/${entryId}/date`, { date })
                .catch((error) => displayError(error));
            }
          }}
          dateFormat="dd/MM/yyyy"
          className="w-32 cursor-pointer rounded-lg bg-neutral p-3 focus:bg-neutral-focus"
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
