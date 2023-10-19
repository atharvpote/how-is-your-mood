"use client";

import {
  MutableRefObject,
  PropsWithChildren,
  createContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { EntryAnalysis, SetState } from "@/utils";

export const AnalysisContext = createContext<{
  analysis: EntryAnalysis;
  setAnalysis: SetState<EntryAnalysis>;
  loading: boolean;
  setLoading: SetState<boolean>;
  cache: MutableRefObject<Map<string, EntryAnalysis>>;
} | null>(null);

export default function AnalysisContextProvider({
  children,
  content,
  initialAnalysis,
}: PropsWithChildren<{ content: string; initialAnalysis: EntryAnalysis }>) {
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
