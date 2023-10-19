"use client";

import { EntryDateContext } from "@/contexts/entryDate";
import { errorAlert, isTouchDevice, showPicker } from "@/utils";
import axios from "axios";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

export default function EntryDate() {
  const { id } = useParams();

  if (Array.isArray(id)) throw new Error("Invalid Entry ID");

  const entryDateContext = useContext(EntryDateContext);

  if (entryDateContext === null)
    throw new Error(
      "EntryDateContext must be used within EntryDateContextProvider",
    );

  const { date, setDate } = entryDateContext;

  const [touchDevice, setTouchDevice] = useState(false);

  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    isTouchDevice() ? setTouchDevice(true) : setTouchDevice(false);
  }, []);

  return (
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
              .put(`/api/entry/${id}/update/date`, { date })
              .catch((error) => errorAlert(error));
          }}
        />
      </span>
    </div>
  );
}
