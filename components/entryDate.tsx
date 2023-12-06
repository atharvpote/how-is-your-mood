"use client";

import { EntryDateContext } from "@/contexts/entryDate";
import { isTouchDevice } from "@/utils";
import { errorAlert } from "@/utils/error";
import axios from "axios";
import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function EntryDate() {
  const { id } = useParams();

  if (!id || Array.isArray(id)) throw new Error("Entry ID is undefined");

  const entryDateContext = useContext(EntryDateContext);

  if (!entryDateContext)
    throw new Error(
      "EntryDateContext must be used within EntryDateContextProvider",
    );

  const { date, setDate } = entryDateContext;

  const [touchDevice, setTouchDevice] = useState(false);

  useEffect(() => {
    isTouchDevice() ? setTouchDevice(true) : setTouchDevice(false);
  }, []);

  return (
    <div
      className={!touchDevice ? "tooltip tooltip-right" : ""}
      data-tip="Date of Entry"
    >
      <span className="text-lg font-medium text-neutral-content">
        <DatePicker
          value={date}
          onChange={(date) => {
            if (date) {
              setDate(date);

              axios
                .put(`/api/entry/${id}/update/date`, { date })
                .catch((error) => {
                  errorAlert(error);
                });
            }
          }}
          format="dd/MM/yyyy"
        />
      </span>
    </div>
  );
}
