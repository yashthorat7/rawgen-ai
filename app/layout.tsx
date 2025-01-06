import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const mulish = Mulish({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeX",
  description: "Your Coding Summarizer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={mulish.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}