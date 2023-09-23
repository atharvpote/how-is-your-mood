"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { displayError, updateDate } from "@/utils/client";
import useEntryDate from "@/utils/hooks";

import "react-datepicker/dist/react-datepicker.css";
import "@/style/datePicker.css";

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
      <h2 className="text-lg font-medium text-accent">
        <DatePicker
          selected={date}
          onChange={(date) => {
            if (date) {
              setDate(date);

              updateDate(date, entryId).catch((error) => displayError(error));
            }
          }}
          dateFormat="dd/MM/yyyy"
          className="w-32 cursor-pointer rounded-lg bg-base-200 p-3"
        />
      </h2>
    </div>
  );
}
