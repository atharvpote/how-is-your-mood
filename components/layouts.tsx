import { PropsWithChildren } from "react";

export function HistoryHeightFull({ children }: PropsWithChildren) {
  return (
    <div className="flex h-[calc(100vh-11rem)] items-center justify-center sm:h-[calc(100vh-7rem)]">
      {children}
    </div>
  );
}
