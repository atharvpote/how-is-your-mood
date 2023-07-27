"use client";

import { useTheme } from "@/utils/client";
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

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
