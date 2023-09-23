"use client";

import { SignIn as ClerkSignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useGlobalTheme } from "@/utils/hooks";

export default function SignIn() {
  return (
    <ClerkSignIn
      appearance={useGlobalTheme() === "dark" ? { baseTheme: dark } : {}}
    />
  );
}
