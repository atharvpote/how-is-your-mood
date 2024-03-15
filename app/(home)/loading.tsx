import { LoadingSpinner } from "@/components/server/loading";

export default function HomeLoading() {
  return (
    <div className="flex h-svh items-center justify-center">
      <div>
        <LoadingSpinner />
      </div>
    </div>
  );
}
