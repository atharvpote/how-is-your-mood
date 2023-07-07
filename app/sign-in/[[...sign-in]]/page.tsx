import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="grid min-h-screen place-content-center dark:bg-black">
      <SignIn />
    </div>
  );
}
