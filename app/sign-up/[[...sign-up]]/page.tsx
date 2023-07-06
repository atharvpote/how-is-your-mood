import { SignUp } from "@clerk/nextjs";

import type { JSX } from "react";

export default function SignUpPage(): JSX.Element {
  return (
    <div className="grid min-h-screen place-content-center dark:bg-black">
      <SignUp />
    </div>
  );
}
