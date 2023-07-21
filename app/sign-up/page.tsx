import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen place-content-center">
      <SignUp />
    </div>
  );
}
