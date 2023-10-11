"use client";

import { UserProfile } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";

export default function Profile() {
  return (
    <UserProfile
      appearance={{
        baseTheme: shadesOfPurple,
      }}
    />
  );
}
