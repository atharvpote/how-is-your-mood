import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen place-content-center dark:bg-black">
      <SignUp />
    </div>
  );
}
