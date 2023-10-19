"use client";

import { SetState, setTimeToMidnight } from "@/utils";
import { endOfWeek, startOfWeek } from "date-fns";
import { PropsWithChildren, createContext, useMemo, useState } from "react";

export const HistoryDateRangeContext = createContext<{
  mostRecent: Date;
  setMostRecent: SetState<Date>;
  start: Date;
  setStart: SetState<Date>;
  end: Date;
  setEnd: SetState<Date>;
} | null>(null);

export default function HistoryContextProvider({
  children,
  initialRecent,
}: PropsWithChildren<{ initialRecent: Date }>) {
  const [mostRecent, setMostRecent] = useState(initialRecent);
  const [start, setStart] = useState(
    setTimeToMidnight(startOfWeek(mostRecent)),
  );
  const [end, setEnd] = useState(setTimeToMidnight(endOfWeek(mostRecent)));

  const value = useMemo(
    () => ({
      mostRecent,
      setMostRecent,
      start,
      setStart,
      end,
      setEnd,
    }),
    [end, mostRecent, start],
  );

  return (
    <HistoryDateRangeContext.Provider value={value}>
      {children}
    </HistoryDateRangeContext.Provider>
  );
}
