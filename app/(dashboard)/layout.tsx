import { PropsWithChildren } from "react";
import Drawer from "@/components/drawer";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto max-w-screen-2xl ">
      <Drawer>{children}</Drawer>
    </div>
  );
}
