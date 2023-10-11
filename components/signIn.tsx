"use client";

import { SignIn as ClerkSignIn } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";

export default function SignIn() {
  return <ClerkSignIn appearance={{ baseTheme: shadesOfPurple }} />;
}
