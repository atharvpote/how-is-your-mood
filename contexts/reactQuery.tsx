"use client";

import { ReadonlyPropsWithChildren } from "@/utils/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function ReactQueryContext({ children }: ReadonlyPropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
