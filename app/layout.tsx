import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { Footer } from '@/components/Footer';

const mulish = Mulish({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CodeX",
  description: "Your Competitive Programming Portfolio Summarizer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={mulish.className}>
        <ClerkProvider>
          <ConvexClientProvider>
            {children}
            <Footer />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}