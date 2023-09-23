import { PropsWithChildren } from "react";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "How Is Your Mood?",
  description: "The AI powered journal app.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <ClerkProvider appearance={{ variables: { colorPrimary: "#6419e6" } }}>
      <html lang="en">
        <body className={`bg-base-100 ${inter.className}`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
