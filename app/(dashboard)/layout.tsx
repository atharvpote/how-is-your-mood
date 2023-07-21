import { PropsWithChildren } from "react";
import Drawer from "@/components/drawer";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto max-w-screen-2xl bg-base-100">
      <Drawer>{children}</Drawer>
    </div>
  );
}
