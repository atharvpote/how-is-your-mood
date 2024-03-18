import { JournalSelect } from "@/drizzle/schema";
import { Dispatch, PropsWithChildren, SetStateAction } from "react";

export interface RequestContext {
  params: { id?: string };
}

export type ErrorBoundaryProps = Readonly<{
  error: Error & { digest?: string };
}>;

export type JournalEntry = Omit<
  JournalSelect,
  "userId" | "createdAt" | "updatedAt" | "preview"
>;

export type JournalAnalysis = Pick<
  JournalSelect,
  "sentiment" | "mood" | "emoji" | "subject" | "summery"
>;

export type JournalAnalysisChart = Pick<
  JournalSelect,
  "sentiment" | "mood" | "emoji" | "date"
>;

export type JournalPreview = Pick<JournalSelect, "id" | "date" | "preview">;

export type SetState<T> = Dispatch<SetStateAction<T>>;

export type ReadonlyPropsWithChildren<P = unknown> = Readonly<
  PropsWithChildren<P>
>;
