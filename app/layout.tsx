import { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";
import { ReadonlyPropsWithChildren } from "@/utils/types";

import "./globals.css";
import { ReactQueryContext } from "@/contexts/reactQuery";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "How Is Your Mood?",
  description: "The AI powered journal app.",
  icons: "/icon.png",
};

export default function RootLayout({ children }: ReadonlyPropsWithChildren) {
  return (
    <ClerkProvider appearance={{ baseTheme: shadesOfPurple }}>
      <ReactQueryContext>
        <html lang="en">
          <body className={`bg-base-100 ${inter.className}`}>{children}</body>
        </html>
      </ReactQueryContext>
    </ClerkProvider>
  );
}
