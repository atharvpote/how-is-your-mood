"use client";

import { EntryAnalysis } from "@/utils/types";
import {
  Dispatch,
  MutableRefObject,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useMemo,
  useRef,
  useState,
} from "react";

export const AnalysisContext = createContext<{
  analysis: EntryAnalysis;
  setAnalysis: Dispatch<SetStateAction<EntryAnalysis>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  cache: MutableRefObject<Map<string, EntryAnalysis>>;
} | null>(null);

export default function AnalysisContextProvider({
  children,
  content,
  analysis: initialAnalysis,
}: PropsWithChildren<{ content: string; analysis: EntryAnalysis }>) {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [loading, setLoading] = useState(false);

  const cache = useRef(new Map([[content.trim(), analysis]]));

  const value = useMemo(
    () => ({ analysis, setAnalysis, loading, setLoading, cache }),
    [analysis, loading],
  );

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}
