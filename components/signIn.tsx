"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "@/utils/hooks";

export default function SignInComponent() {
  const elements = { card: "bg-base-100" };

  return (
    <SignIn
      appearance={
        useTheme() === "dark"
          ? {
              baseTheme: dark,
              elements,
            }
          : { elements }
      }
    />
  );
}
