import { ReadonlyPropsWithChildren } from "@/utils/types";

export function HistoryHeightFull({ children }: ReadonlyPropsWithChildren) {
  return (
    <div className="flex h-[calc(100svh-11rem)] items-center justify-center sm:h-[calc(100svh-7rem)]">
      {children}
    </div>
  );
}

export function JournalFullHeight({ children }: ReadonlyPropsWithChildren) {
  return (
    <div className="flex h-[var(--journal-page-remaining-space)] items-center justify-center sm:h-[--journal-page-remaining-space-sm-breakpoint]">
      {children}
    </div>
  );
}
