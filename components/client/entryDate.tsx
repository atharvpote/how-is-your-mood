"use client";

import { adjustUiForTouchDevice } from "@/utils";
import { useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { SetState } from "@/utils/types";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";

export default function EntryDate({
  date,
  setDate,
  id,
}: Readonly<{
  date: Date;
  setDate: SetState<Date>;
  id: string;
}>) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const { mutate } = useMutateDate(useQueryClient());

  useEffect(() => {
    adjustUiForTouchDevice(setIsTouchDevice);
  }, []);

  return (
    <div
      className={!isTouchDevice ? "tooltip tooltip-right" : ""}
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
      await axios.put(`/api/entry/${id}/mutate/date`, { date });

      return date;
    },
    onSuccess: async (_, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ["entry", id] });
    },
  });
}
