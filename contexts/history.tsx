"use client";

import { setTimeToMidnight } from "@/utils";
import { SetState } from "@/utils/types";
import { endOfWeek, startOfWeek } from "date-fns";
import { PropsWithChildren, createContext, useMemo, useState } from "react";

export const HistoryDateRangeContext = createContext<{
  recent: Date;
  setRecent: SetState<Date>;
  start: Date;
  setStart: SetState<Date>;
  end: Date;
  setEnd: SetState<Date>;
} | null>(null);

export default function HistoryContextProvider({
  children,
  initialRecent,
}: PropsWithChildren<{ initialRecent: Date }>) {
  const [recent, setRecent] = useState(initialRecent);
  const [start, setStart] = useState(setTimeToMidnight(startOfWeek(recent)));
  const [end, setEnd] = useState(setTimeToMidnight(endOfWeek(recent)));

  const value = useMemo(
    () => ({
      recent,
      setRecent,
      start,
      setStart,
      end,
      setEnd,
    }),
    [end, recent, start],
  );

  return (
    <HistoryDateRangeContext.Provider value={value}>
      {children}
    </HistoryDateRangeContext.Provider>
  );
}
