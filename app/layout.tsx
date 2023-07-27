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
    <ClerkProvider appearance={{ variables: { colorPrimary: "#1dcdbc" } }}>
      <html lang="en">
        <body className={`bg-slate-50 dark:bg-slate-950 ${inter.className}`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
