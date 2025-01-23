import { Loader2, X } from "lucide-react";
import { SignIn, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { Hero } from "@/components/layout/Hero";
import Link from "next/link";

export default function Page() {
  return (
    <div className="relative min-h-screen">
      {/* Background Hero */}
      <div className="absolute inset-0 blur-[2px] brightness-[0.98] z-0">
        <Hero />
      </div>

      {/* White Overlay */}
      <div className="absolute inset-0 bg-white/60 z-[1]" />

      {/* Close Button */}
      <Link
        href={process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}
        className="fixed top-6 right-6 lg:top-[20%] lg:right-[38%] p-2 rounded-full bg-white hover:bg-white/80 shadow-xl transition-all hover:scale-110 z-[20]" 
      >
        <X className="w-6 h-6 text-gray-600" />
      </Link>

      {/* Sign In Content */}
      <div className="relative flex min-h-screen items-center justify-center z-[2]">
        <div className="w-full max-w-md px-4">
          <ClerkLoaded>
            <SignIn />
          </ClerkLoaded>
          <ClerkLoading>
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          </ClerkLoading>
        </div>
      </div>
    </div>
  );
}
