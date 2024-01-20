"use client";

import { HistoryDateRangeContext } from "@/contexts/history";
import { HistoryDateContextInterface } from "@/utils/types";
import { notNullValidator } from "@/utils/validator";
import { useContext } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function HistoryDateRange() {
  const historyDateRangeContext = useContext(HistoryDateRangeContext);

  notNullValidator<HistoryDateContextInterface>(
    historyDateRangeContext,
    "HistoryContext must be used within HistoryContextProvider",
  );

  const { start, setStart, end, setEnd } = historyDateRangeContext;

  return (
    <div className="form-control">
      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <span>From</span>
        <DatePicker
          value={start}
          onChange={(start) => {
            if (start) {
              setStart(start);
            }
          }}
          format="dd/MM/yyyy"
        />
        <span>To</span>
        <DatePicker
          value={end}
          onChange={(end) => {
            if (end) {
              setEnd(end);
            }
          }}
          format="dd/MM/yyyy"
        />
      </div>
    </div>
  );
}
