"use client";

import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useGlobalTheme } from "@/utils/hooks";

export default function Profile() {
  return (
    <UserProfile
      appearance={
        useGlobalTheme() === "dark"
          ? {
              baseTheme: dark,
            }
          : {}
      }
    />
  );
}
