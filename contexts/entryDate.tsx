"use client";

import { SetState } from "@/utils/types";
import { PropsWithChildren, createContext, useMemo, useState } from "react";

export const EntryDateContext = createContext<{
  date: Date;
  setDate: SetState<Date>;
} | null>(null);

export default function EntryDateContextProvider({
  children,
  initialDate,
}: PropsWithChildren<{ initialDate: Date }>) {
  const [date, setDate] = useState(initialDate);

  const value = useMemo(() => ({ date, setDate }), [date]);

  return (
    <EntryDateContext.Provider value={value}>
      {children}
    </EntryDateContext.Provider>
  );
}
