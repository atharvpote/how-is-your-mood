"use client";

import { isTouchDevice } from "@/utils";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Entry, SetState } from "@/utils/types";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { mutateEntryDate } from "@/utils/actions";

export default function EntryDate({
  date,
  setDate,
  id,
}: Readonly<{
  date: Date;
  setDate: SetState<Date>;
  id: string;
}>) {
  const { mutate } = useMutateDate(useQueryClient());

  return (
    <div
      className={!isTouchDevice() ? "tooltip tooltip-right" : ""}
      data-tip="Date of Entry"
    >
      <span className="text-lg font-medium text-neutral-content">
        <DatePicker
          value={date}
          onChange={(date) => {
            if (date) {
              setDate(date);

              mutate({ date, id });
            }
          }}
          format="dd/MM/yyyy"
        />
      </span>
    </div>
  );
}

function useMutateDate(queryClient: QueryClient) {
  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date: Date }) => {
      await mutateEntryDate(id, date);

      return date;
    },
    onSuccess: (date, { id }) => {
      queryClient.setQueryData(["entry", id], (oldDate: Entry) => ({
        ...oldDate,
        date,
      }));
    },
  });
}
