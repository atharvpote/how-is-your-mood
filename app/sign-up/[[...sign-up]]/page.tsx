import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { AiOutlineArrowLeft } from "react-icons/ai";

export default function SignUpPage() {
  return (
    <div className="min-h-screen">
      <nav className="flex justify-start p-2">
        <Link href={"/"} prefetch className="btn btn-ghost">
          <AiOutlineArrowLeft /> Back
        </Link>
      </nav>
      <div className="flex min-h-[calc(100vh-var(--global-nav-height))] items-center justify-center">
        <SignUp />
      </div>
    </div>
  );
}
