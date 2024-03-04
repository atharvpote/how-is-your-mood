import { AnalysisSelect, JournalSelect } from "@/drizzle/schema";
import { Dispatch, PropsWithChildren, SetStateAction } from "react";

export interface RequestContext {
  params: { id?: string };
}

export type ErrorBoundaryProps = Readonly<{
  error: Error & { digest?: string };
}>;

export type ChartAnalysis = Pick<
  AnalysisSelect,
  "sentiment" | "mood" | "emoji"
> & { journal: Pick<JournalSelect, "date"> };

export type Analysis = Pick<
  AnalysisSelect,
  "sentiment" | "mood" | "emoji" | "subject" | "summery"
>;

export type Journal = Pick<JournalSelect, "content" | "date" | "id">;

export type Entry = Journal & { analysis: Analysis };

export type Preview = Omit<Journal, "content"> & Pick<JournalSelect, "preview">;

export type SetState<T> = Dispatch<SetStateAction<T>>;

export type ReadonlyPropsWithChildren<P = unknown> = Readonly<
  PropsWithChildren<P>
>;
