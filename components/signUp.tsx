"use client";

import { SignUp as ClerkSignUp } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";

export default function SignUp() {
  return <ClerkSignUp appearance={{ baseTheme: shadesOfPurple }} />;
}
