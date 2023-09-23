"use client";

import { SignUp as ClerkSignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useGlobalTheme } from "@/utils/hooks";

export default function SignUp() {
  return (
    <ClerkSignUp
      appearance={useGlobalTheme() === "dark" ? { baseTheme: dark } : {}}
    />
  );
}
