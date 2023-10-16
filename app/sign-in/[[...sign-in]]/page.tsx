import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { globalNavHeight } from "@/utils";

export default function SignInPage() {
  return (
    <div className="min-h-screen">
      <nav className="flex justify-start p-2">
        <Link href={"/"} prefetch className="btn btn-ghost">
          <AiOutlineArrowLeft /> Back
        </Link>
      </nav>
      <div
        className={
          "flex items-center justify-center" +
          " " +
          `min-h-[calc(100vh-${globalNavHeight}rem)]`
        }
      >
        <SignIn />
      </div>
    </div>
  );
}
