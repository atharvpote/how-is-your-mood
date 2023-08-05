"use client";

import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "@/utils/hooks";

export default function Profile() {
  const elements = { card: "shadow-none bg-base-100" };

  return (
    <div className="min-h-screen pb-4 sm:pb-0 sm:pl-4">
      <UserProfile
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
