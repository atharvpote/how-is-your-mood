import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import { ReadonlyPropsWithChildren } from "@/utils/types";

export default function HomeTemplate({ children }: ReadonlyPropsWithChildren) {
  if (auth().userId !== null) redirect("/journal");

  return <>{children}</>;
}
