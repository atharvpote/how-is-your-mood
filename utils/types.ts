import { Dispatch, PropsWithChildren, SetStateAction } from "react";
import { Analysis, Journal } from "@prisma/client";

export interface RequestContext {
  params: { id?: string };
}

export type ErrorBoundaryProps = Readonly<{
  error: Error & { digest?: string };
}>;

export type ChartAnalysis = Pick<
  Analysis,
  "sentiment" | "date" | "mood" | "emoji"
>;

export type EntryWithAnalysis = Entry & { analysis: EntryAnalysis };

export type EntryAnalysis = Pick<
  Analysis,
  "sentiment" | "mood" | "emoji" | "subject" | "summery"
>;

export type Entry = Pick<Journal, "content" | "date" | "id">;

export type EntryPreview = Omit<Entry, "content"> & Pick<Journal, "preview">;

export type SetState<T> = Dispatch<SetStateAction<T>>;

export type ReadonlyPropsWithChildren<P = unknown> = Readonly<
  PropsWithChildren<P>
>;

export type Role =
  | "function"
  | "user"
  | "system"
  | "assistant"
  | "data"
  | "tool";

