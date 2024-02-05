import Drawer from "@/components/client/drawer";
import MUIContext from "@/contexts/mui";
import { ReadonlyPropsWithChildren } from "@/utils/types";

export default function DashboardLayout({
  children,
}: ReadonlyPropsWithChildren) {
  return (
    <div className="mx-auto max-w-screen-2xl">
      <Drawer>
        <MUIContext>{children}</MUIContext>
      </Drawer>
    </div>
  );
}
