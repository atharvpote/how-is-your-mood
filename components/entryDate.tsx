"use client";

import { isTouchDevice } from "@/utils";
import { useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { SetState } from "@/utils/types";
import { UseMutateFunction } from "@tanstack/react-query";

export default function EntryDate({
  date,
  setDate,
  mutateDate,
  id,
}: Readonly<{
  date: Date;
  setDate: SetState<Date>;
  mutateDate: UseMutateFunction<
    Date,
    Error,
    {
      id: string;
      date: Date;
    }
  >;
  id: string;
}>) {
  const [touchDevice, setTouchDevice] = useState(false);

  useEffect(() => {
    isTouchDevice() ? setTouchDevice(true) : setTouchDevice(false);
  }, []);

  return (
    <div
      className={!touchDevice ? "tooltip tooltip-right" : undefined}
      data-tip="Date of Entry"
    >
      <span className="text-lg font-medium text-neutral-content">
        <DatePicker
          value={date}
          onChange={(date) => {
            if (date) {
              setDate(date);

              mutateDate({ date, id });
            }
          }}
          format="dd/MM/yyyy"
        />
      </span>
    </div>
  );
}
