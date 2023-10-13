import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  return (
    <div className="navbar lg:px-4">
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
      <div className="flex-1">
        <Link
          href="/"
          prefetch
          className="prose-sm btn btn-ghost h-full w-full max-w-fit"
        >
          <h1 className="font-bold capitalize lg:mx-0 ">
            How is your <span className="text-primary">mood</span>?
          </h1>
        </Link>
      </div>
      <div className="flex-none basis-8">
        <UserButton />
      </div>
    </div>
  );
}
