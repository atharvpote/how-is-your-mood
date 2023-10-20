export function PageLoadingSpinner() {
  return (
    <div className="flex h-[100svh] items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export function DashboardLoadingSpinner() {
  return (
    <div className="h-0 min-h-[calc(100svh-8rem)] sm:min-h-[calc(100svh-4rem)]">
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <span className="loading loading-infinity loading-lg mx-auto block py-4 text-primary"></span>
  );
}
