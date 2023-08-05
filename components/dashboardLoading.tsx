import { LoadingSpinner } from "./loading";

export default function DashboardLoading() {
  return (
    <div className="h-0 min-h-[calc(100vh-4rem)]">
      <div className="grid h-full place-content-center">
        <LoadingSpinner />
      </div>
    </div>
  );
}
