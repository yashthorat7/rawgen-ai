"use client";

import SearchContainer from "@/components/recruiter/search/SearchContainer";
import { Header } from "@/components/recruiter/Header";
import { Footer } from "@/components/layout/Footer";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RecruiterDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [recruiterEmail, setRecruiterEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const recruiter = useQuery(
    api.recruiters.getByEmail,
    recruiterEmail ? { email: recruiterEmail } : "skip",
  );

  useEffect(() => {
    const email = window.localStorage.getItem("recruiterEmail");
    if (!email) {
      router.push("/recruiter");
      return;
    }
    setRecruiterEmail(email);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!recruiterEmail) {
    return null;
  }

  if (recruiter && !recruiter.isPermitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full mx-auto p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Restricted
            </h2>
            <p className="text-gray-600 mb-6">
              Your recruiter account has not been approved yet. Please contact
              the administrator for access.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                window.localStorage.removeItem("recruiterEmail");
                router.push("/recruiter");
              }}
            >
              Back to Login
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!recruiter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed inset-0 bg-gradient-to-b from-transparent to-primary-100/50 pointer-events-none" />

      {/* Dotted Background */}
      <div className="fixed inset-0 dotted-background pointer-events-none" />

      <Header />
      <main className="flex-1 relative">
        <div className="mx-auto px-4 w-full sm:w-[90%]">
          <div className="flex flex-col items-center justify-center w-full">
            {/* Welcome Section */}
            <div className="w-full max-w-4xl mb-12 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Find Top Tech Talent
              </h1>
              <p className="text-lg text-gray-600">
                Explore our pool of talented students and discover skilled,
                job-ready candidates. Simplify your hiring process and find the
                perfect addition to your team with ease and confidence.
              </p>
            </div>

            {/* Search Section */}
            <div className="w-full">
              <SearchContainer recruiterEmail={recruiterEmail} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
