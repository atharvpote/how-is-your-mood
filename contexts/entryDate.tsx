"use client";

import { PropsWithChildren, createContext, useMemo, useState } from "react";
import { EntryDateContextInterface } from "@/utils/types";

export const EntryDateContext = createContext<EntryDateContextInterface | null>(
  null,
);

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
