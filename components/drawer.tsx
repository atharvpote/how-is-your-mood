"use client";

import { PropsWithChildren, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "./navbar";

const links = [
  { href: "/journal", label: "journal" },
  { href: "/question", label: "question" },
  { href: "/history", label: "history" },
  { href: "/profile", label: "profile" },
] as const;

export default function Drawer({ children }: PropsWithChildren) {
  const input = useRef<HTMLInputElement | null>(null);
  const path = usePathname();

  return (
    <div className="drawer bg-base-100 xl:drawer-open">
      <input
        id="my-drawer"
        type="checkbox"
        className="drawer-toggle"
        ref={input}
      />
      <div className="drawer-content">
        {/* Page content here */}
        <Navbar />
        {children}
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <nav className="menu h-full w-52 bg-base-100 p-4 text-base-content">
          {/* Sidebar content here */}
          <ul className="mt-12">
            {links.map(({ href, label }) => (
              <li key={href} className="mb-4">
                <Link
                  href={href}
                  prefetch
                  className={`btn btn-ghost grid place-content-center text-xl capitalize ${
                    label === path.split("/")[1] ? "active" : ""
                  }`}
                  onClick={() => {
                    input.current?.click();
                  }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
