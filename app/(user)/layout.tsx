import Link from "next/link";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { ReadonlyPropsWithChildren } from "@/utils/types";

export default function SignLayout({ children }: ReadonlyPropsWithChildren) {
  return (
    <div className="min-h-[100svh]">
      <nav className="flex justify-start p-2">
        <Link href={"/"} prefetch className="btn btn-ghost">
          <AiOutlineArrowLeft /> Back
        </Link>
      </nav>
      <div className="flex min-h-[calc(100svh-var(--home-navbar-height))] items-center justify-center">
        {children}
      </div>
    </div>
  );
}
