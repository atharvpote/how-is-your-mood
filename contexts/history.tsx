"use client";

import { PropsWithChildren, createContext, useMemo, useState } from "react";
import { endOfWeek, startOfWeek } from "date-fns";
import { HistoryDateContextInterface } from "@/utils/types";

export const HistoryDateRangeContext =
  createContext<HistoryDateContextInterface | null>(null);

export default function HistoryContextProvider({
  children,
  initialMostRecent: initialRecent,
}: PropsWithChildren<{ initialMostRecent: Date }>) {
  const [start, setStart] = useState(startOfWeek(initialRecent));
  const [end, setEnd] = useState(endOfWeek(initialRecent));

  const value = useMemo(
    () => ({
      start,
      setStart,
      end,
      setEnd,
    }),
    [end, start],
  );

  return (
    <HistoryDateRangeContext.Provider value={value}>
      {children}
    </HistoryDateRangeContext.Provider>
  );
}
