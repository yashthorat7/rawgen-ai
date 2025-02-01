/* eslint-disable */
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/layout/ConvexClientProvider";

const quicksand = localFont({
  src: '../public/fonts/Quicksand-VariableFont_wght.ttf',
  display: 'swap',
  variable: '--font-quicksand',
});

export const metadata: Metadata = {
  title: "CodeX",
  description: "Your Competitive Programming Portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={quicksand.className} suppressHydrationWarning>
        <ClerkProvider>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}