"use client";

import { PropsWithChildren, useRef } from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { MdLogout } from "react-icons/md";

const links = [
  { href: "/journal", label: "journal" },
  { href: "/question", label: "question" },
  { href: "/history", label: "history" },
  { href: "/profile", label: "profile" },
] as const;

export default function Drawer({ children }: PropsWithChildren) {
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const section = useSelectedLayoutSegment();

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
          {/* Logout */}
          <div className="flex flex-none basis-12 items-center justify-center">
            <button
              className="btn btn-square btn-ghost text-2xl"
              onClick={() => {
                dialog.current?.showModal();
              }}
            >
              <MdLogout />
            </button>
            <dialog className="modal modal-bottom sm:modal-middle" ref={dialog}>
              <div className="prose modal-box">
                <h3 className="font-bold">You want to log out?</h3>
                <div className="modal-action">
                  <form method="dialog">
                    {/* if there is a button in form, it will close the modal */}
                    <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
                      ✕
                    </button>
                    <div className="flex gap-4">
                      <SignOutButton>
                        <button className="btn btn-neutral">Yes</button>
                      </SignOutButton>
                      <button className="btn btn-outline">No</button>
                    </div>
                  </form>
                </div>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button>close</button>
              </form>
            </dialog>
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
                    label === section ? "active" : ""
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
