"use client";

import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "@/utils/hooks";

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
