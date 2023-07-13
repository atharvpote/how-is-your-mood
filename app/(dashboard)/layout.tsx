import { PropsWithChildren } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({ children }: PropsWithChildren) {
  const links = [
    { href: "/", label: "home" },
    { href: "/journal", label: "journal" },
    { href: "/history", label: "history" },
  ];

  return (
    <div className="min-h-screen">
      <header className="h-14 border-b border-black/10">
        <div className="h-full px-6 flex items-center justify-end">
          <UserButton />
        </div>
      </header>
      <div className="flex">
        <aside className="border-r border-black/10 basis-48 flex-grow-0 flex-shrink-0">
          <div className="text-xl">Mood</div>
          <ul>
            {links.map(({ href, label }) => (
              <li key={href} className="px-2 py-6 text-xl">
                <Link href={href} className="capitalize">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <div className="basis-full">{children}</div>
      </div>
    </div>
  );
}
