import { JournalSelect } from "@/drizzle/schema";
import { Dispatch, PropsWithChildren, SetStateAction } from "react";

export interface RequestContext {
  params: { id?: string };
}

export type ErrorBoundaryProps = Readonly<{
  error: Error & { digest?: string };
}>;

export type Entry = Omit<
  JournalSelect,
  "userId" | "createdAt" | "updatedAt" | "preview"
>;

export type Analysis = Pick<
  JournalSelect,
  "sentiment" | "mood" | "emoji" | "subject" | "summery"
>;

export type ChartAnalysis = Pick<
  JournalSelect,
  "sentiment" | "mood" | "emoji" | "date"
>;

export type Preview = Pick<JournalSelect, "id" | "date" | "preview">;

export type SetState<T> = Dispatch<SetStateAction<T>>;

export type ReadonlyPropsWithChildren<P = unknown> = Readonly<
  PropsWithChildren<P>
>;

export type Metadata = Omit<JournalSelect, "embedded" | "emoji" | "preview"> & {
  userId: string;
};
