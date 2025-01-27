"use client";

import { SignIn } from "@clerk/nextjs";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-primary-50 to-white">
      {/* Close Button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all hover:scale-105 hover:bg-white/90"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white/70 backdrop-blur-lg shadow-xl border border-primary-100",
            headerTitle: "text-primary-600",
            headerSubtitle: "text-gray-600",
            socialButtonsBlockButton: "bg-white hover:bg-gray-50",
            formButtonPrimary: "bg-primary-600 hover:bg-primary-700",
            footerActionLink: "text-primary-600 hover:text-primary-700"
          },
        }}
      />
    </div>
  );
} 