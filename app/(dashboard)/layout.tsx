import Drawer from "@/components/drawer";
import { ReadonlyPropsWithChildren } from "@/utils/types";

export default function DashboardLayout({
  children,
}: ReadonlyPropsWithChildren) {
  return (
    <div className="mx-auto max-w-screen-2xl">
      <Drawer>{children}</Drawer>
    </div>
  );
}
