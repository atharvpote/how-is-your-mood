"use client";

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "@/utils/hooks";

export default function SignUpPage() {
  const elements = { card: "bg-base-100" };

  return (
    <div className="grid min-h-screen place-content-center">
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
    </div>
  );
}
