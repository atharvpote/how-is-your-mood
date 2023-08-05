import { LoadingSpinner } from "./loading";

export default function TopLevelLoading() {
  return (
    <div className="grid h-screen place-content-center">
      <LoadingSpinner />
    </div>
  );
}
