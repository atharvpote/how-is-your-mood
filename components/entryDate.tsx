"use client";

import { useState } from "react";
import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";
import { errorAlert, updateDate } from "@/utils/client";

interface PropTypes {
  entryDate: Date;
  entryId: string;
}

export default function EntryDate({ entryDate, entryId }: PropTypes) {
  const [date, setDate] = useState<DateValueType>({
    startDate: entryDate,
    endDate: entryDate,
  });

  return (
    <div className="tooltip tooltip-right" data-tip="Date of Entry">
      <h2 className="text-lg font-medium text-accent">
        <Datepicker
          useRange={false}
          asSingle={true}
          displayFormat={"DD/MM/YYYY"}
          primaryColor={"teal"}
          inputClassName="cursor-pointer w-48 rounded-lg bg-base-200 text-base-content px-4 py-3 focus:bg-base-300"
          showShortcuts={true}
          configs={{
            shortcuts: {
              today: "Today",
              yesterday: "Yesterday",
            },
          }}
          value={date}
          onChange={(value: DateValueType) => {
            setDate(value);

            if (value?.startDate)
              updateDate(new Date(value.startDate.toString()), entryId).catch(
                (error) => errorAlert(error),
              );
          }}
        />
      </h2>
    </div>
  );
}
