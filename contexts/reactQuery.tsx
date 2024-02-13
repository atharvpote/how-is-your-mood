"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReadonlyPropsWithChildren } from "@/utils/types";

export function ReactQueryContext({ children }: ReadonlyPropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
