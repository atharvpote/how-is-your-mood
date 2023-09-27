"use client";

import { usePrefersColor } from "@/utils/hooks";
import { SignIn as ClerkSignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignIn() {
  return (
    <ClerkSignIn appearance={usePrefersColor() ? { baseTheme: dark } : {}} />
  );
}
