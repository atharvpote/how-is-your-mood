import { SignIn } from "@clerk/nextjs";

import type { JSX } from "react";

export default function SignInPage(): JSX.Element {
  return (
    <div className="grid min-h-screen place-content-center dark:bg-black">
      <SignIn />
    </div>
  );
}
