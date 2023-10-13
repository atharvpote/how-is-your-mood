export function LoadingSpinner() {
  return (
    <span className="loading loading-infinity loading-lg mx-auto my-4 block text-primary"></span>
  );
}
export function DashboardLoadingSpinner() {
  return (
    <div className="h-0 min-h-[calc(100vh-4rem)]">
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
