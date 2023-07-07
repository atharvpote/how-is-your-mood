import { UserButton } from "@clerk/nextjs";

import type { PropsWithChildren } from "react";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="h-screen flex">
      <aside className="border-r border-black/10 basis-48">Mood</aside>
      <div className="basis-full">
        <header className="h-14 border-b border-black/10">
          <div className="h-full px-6 flex items-center justify-end">
            <UserButton />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
