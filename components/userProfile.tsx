"use client";

import { usePrefersColor } from "@/utils/hooks";
import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Profile() {
  return (
    <UserProfile appearance={usePrefersColor() ? { baseTheme: dark } : {}} />
  );
}
