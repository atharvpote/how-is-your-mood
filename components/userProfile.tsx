"use client";

import { useTheme } from "@/utils/hooks";
import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function ProfileComponent() {
  const elements = { card: "shadow-none bg-base-100" };

  return (
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
  );
}
