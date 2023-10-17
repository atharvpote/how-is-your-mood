import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import { PropsWithChildren } from "react";

export default function HomeTemplate({ children }: PropsWithChildren) {
  if (auth().userId !== null) redirect("/journal");

  return <>{children}</>;
}
