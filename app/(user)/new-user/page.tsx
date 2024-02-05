import { LoadingSpinner } from "@/components/server/loading";

export default function NewUser() {
  return (
    <div className="flex h-[100svh] items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
