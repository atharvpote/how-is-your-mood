"use client";

import {
  PropsWithChildren,
  createContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnalysisContextInterface, EntryAnalysis } from "@/utils/types";

export const AnalysisContext = createContext<AnalysisContextInterface | null>(
  null,
);

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
