"use client";

import { PropsWithChildren, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

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
    <div className="drawer bg-base-100 lg:drawer-open">
      <input
        id="my-drawer"
        type="checkbox"
        className="drawer-toggle"
        ref={input}
      />
      <div className="drawer-content">
        {/* Page content here */}
        {/* Navbar */}
        <nav className="navbar h-32 sm:h-16 lg:px-4">
          <div className="flex-none">
            <label
              htmlFor="my-drawer"
              className="btn btn-square btn-ghost drawer-button lg:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-5 w-5 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div className="grow basis-full">
            <Link
              href="/"
              prefetch
              className="prose-sm btn btn-ghost h-full max-w-fit"
            >
              <h1 className="font-bold capitalize">
                How is your <span className="text-primary">mood</span>?
              </h1>
            </Link>
          </div>
          <div className="flex flex-none basis-12 items-center justify-center">
            <UserButton
              userProfileMode="navigation"
              userProfileUrl="/profile"
              afterSignOutUrl="/"
            />
          </div>
        </nav>
        {children}
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <nav className="menu h-full w-52 justify-center bg-base-100 p-4 text-base-content sm:justify-start">
          {/* Sidebar content here */}
          <ul className="sm:mt-16">
            {links.map(({ href, label }) => (
              <li key={href} className="mb-4">
                <Link
                  href={href}
                  prefetch
                  className={`btn btn-ghost flex items-center justify-center text-xl capitalize ${
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
