"use client";

import { SetState } from "@/utils";
import { endOfWeek, startOfWeek } from "date-fns";
import { PropsWithChildren, createContext, useMemo, useState } from "react";

export const HistoryDateRangeContext = createContext<{
  start: Date;
  setStart: SetState<Date>;
  end: Date;
  setEnd: SetState<Date>;
} | null>(null);

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
