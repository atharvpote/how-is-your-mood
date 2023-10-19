import { LoadingSpinner } from "@/components/loading";

export default function EntriesLoading() {
  return (
    <div className="flex h-0 min-h-[calc(100svh-(var(--dashboard-nav-height)+var(--journal-header-height)))] items-center justify-center sm:min-h-[calc(100svh-(var(--dashboard-nav-height-sm)+var(--journal-header-height)))]">
      <LoadingSpinner />
    </div>
  );
}
