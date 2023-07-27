"use client";

import { useTheme } from "@/utils/client";
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignInPage() {
  const elements = { card: "bg-base-100" };

  return (
    <div className="grid min-h-screen place-content-center">
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
    </div>
  );
}
