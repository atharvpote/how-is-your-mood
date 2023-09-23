import { LoadingSpinner } from "./loading";

export default function PageLoading() {
  return (
    <div className="grid h-screen place-content-center">
      <LoadingSpinner />
    </div>
  );
}
