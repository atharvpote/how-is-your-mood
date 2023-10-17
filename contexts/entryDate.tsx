"use client";

import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useMemo,
  useState,
} from "react";

export const EntryDateContext = createContext<{
  date: Date;
  setDate: Dispatch<SetStateAction<Date>>;
} | null>(null);

export default function EntryDateContextProvider({
  children,
  date: initialDate,
}: PropsWithChildren<{ date: Date }>) {
  const [date, setDate] = useState(initialDate);

  const value = useMemo(() => ({ date, setDate }), [date]);

  return (
    <EntryDateContext.Provider value={value}>
      {children}
    </EntryDateContext.Provider>
  );
}
