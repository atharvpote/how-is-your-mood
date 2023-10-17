"use client";

import { setTimeToMidnight } from "@/utils";
import { endOfWeek, startOfWeek } from "date-fns";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useMemo,
  useState,
} from "react";

export const HistoryDateRangeContext = createContext<{
  recent: Date;
  setRecent: Dispatch<SetStateAction<Date>>;
  start: Date;
  setStart: Dispatch<SetStateAction<Date>>;
  end: Date;
  setEnd: Dispatch<SetStateAction<Date>>;
  showAllDates: boolean;
  setShowAllDates: Dispatch<SetStateAction<boolean>>;
} | null>(null);

export default function HistoryContextProvider({
  children,
  recent: initialRecent,
}: PropsWithChildren<{ recent: Date }>) {
  const [recent, setRecent] = useState(initialRecent);
  const [start, setStart] = useState(setTimeToMidnight(startOfWeek(recent)));
  const [end, setEnd] = useState(setTimeToMidnight(endOfWeek(recent)));
  const [showAllDates, setShowAllDates] = useState(false);

  const value = useMemo(
    () => ({
      recent,
      setRecent,
      start,
      setStart,
      end,
      setEnd,
      showAllDates,
      setShowAllDates,
    }),
    [end, recent, showAllDates, start],
  );

  return (
    <HistoryDateRangeContext.Provider value={value}>
      {children}
    </HistoryDateRangeContext.Provider>
  );
}
