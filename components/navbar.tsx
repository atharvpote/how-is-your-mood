import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  return (
    <div className="navbar bg-base-100">
      <div className="flex-none">
        <label
          htmlFor="my-drawer"
          className="btn-ghost drawer-button btn-square btn lg:hidden"
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
      <div className="flex-1">
        <Link href="/">
          <h1 className="text-xl font-bold capitalize">How is your mood?</h1>
        </Link>
      </div>
      <div className="flex-none">
        <UserButton />
      </div>
    </div>
  );
}
