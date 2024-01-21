import {
  Dispatch,
  MutableRefObject,
  PropsWithChildren,
  SetStateAction,
} from "react";
import { Analysis, Journal } from "@prisma/client";

export interface RequestContext {
  params: { id?: string };
}

export type ErrorBoundaryProps = Readonly<{
  error: Error & { digest?: string };
}>;

export interface AnalysisContextInterface {
  analysis: EntryAnalysis;
  setAnalysis: SetState<EntryAnalysis>;
  loading: boolean;
  setLoading: SetState<boolean>;
  cache: MutableRefObject<Map<string, EntryAnalysis>>;
}

export interface HistoryDateContextInterface {
  start: Date;
  setStart: SetState<Date>;
  end: Date;
  setEnd: SetState<Date>;
}

export interface EntryDateContextInterface {
  date: Date;
  setDate: SetState<Date>;
}

export type ChartAnalysis = Pick<
  Analysis,
  "sentiment" | "date" | "mood" | "emoji"
>;

export type EntryAnalysis = Pick<
  Analysis,
  "sentiment" | "mood" | "emoji" | "subject" | "summery"
>;

export type Entry = Pick<Journal, "content" | "date" | "id">;

export type EntryPreview = Omit<Entry, "content"> & Pick<Journal, "preview">;

export type SetState<T> = Dispatch<SetStateAction<T>>;

export type DataWithSerializedDate<T> = T & { date: string };

export type ReadonlyPropsWithChildren<P = unknown> = Readonly<
  PropsWithChildren<P>
>;

export type Role = "user" | "ai" | "system";

export interface Message {
  role: Role;
  message: string;
  id: string;
}
