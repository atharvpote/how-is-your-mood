"use client";

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "@/utils/hooks";

export default function SignUpComponent() {
  const elements = { card: "bg-base-100" };

  return (
    <SignUp
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
