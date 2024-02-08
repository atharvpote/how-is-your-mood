import { Dispatch, PropsWithChildren, SetStateAction } from "react";
import {
  Analysis as PrismaAnalysis,
  Journal as PrismaJournal,
} from "@prisma/client";

export interface RequestContext {
  params: { id?: string };
}

export type ErrorBoundaryProps = Readonly<{
  error: Error & { digest?: string };
}>;

export type ChartAnalysis = Pick<
  PrismaAnalysis,
  "sentiment" | "date" | "mood" | "emoji"
>;

export type Analysis = Pick<
  PrismaAnalysis,
  "sentiment" | "mood" | "emoji" | "subject" | "summery"
>;

export type Entry = Pick<PrismaJournal, "content" | "date" | "id">;

export type EntryAndAnalysis = Entry & { analysis: Analysis };

export type Preview = Omit<Entry, "content"> & Pick<PrismaJournal, "preview">;

export type SetState<T> = Dispatch<SetStateAction<T>>;

export type ReadonlyPropsWithChildren<P = unknown> = Readonly<
  PropsWithChildren<P>
>;
