"use client";

import { usePrefersColor } from "@/utils/hooks";
import { SignUp as ClerkSignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUp() {
  return (
    <ClerkSignUp appearance={usePrefersColor() ? { baseTheme: dark } : {}} />
  );
}
